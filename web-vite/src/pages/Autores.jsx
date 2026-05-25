import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Search, Library, Quote, ArrowRight, Book, Feather } from 'lucide-react'; 

// --- IMPORTS REAIS DO SEU PROJETO ---
import { Button } from '../components/ui/Button'; 
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// ==================================================================================
// 1. COMPONENTE DE APRESENTAÇÃO (VIEW)
// ==================================================================================
const AutoresView = ({ autores, selecionado, setSelecionado, wikiData, loadingWiki }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]); 
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);

  const sheenOpacity = useTransform(mouseY, [-0.5, 0.5], [0, 0.3]);
  const sheenGradient = useTransform(
    mouseX, 
    [-0.5, 0.5], 
    ["linear-gradient(115deg, transparent 40%, rgba(194,168,120,0.15) 45%, rgba(194,168,120,0.3) 50%, transparent 55%)", 
     "linear-gradient(115deg, transparent 40%, rgba(194,168,120,0.0) 45%, rgba(194,168,120,0.0) 50%, transparent 55%)"]
  );

  const shadowX = useTransform(mouseX, [-0.5, 0.5], ["-30px", "30px"]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], ["-30px", "30px"]);

  const defaultImage = "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop"; 

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
    // Removidos os fundos duros para que a textura global orgânica apareça
    <div className="flex flex-col md:flex-row h-screen w-full bg-transparent text-antique-white font-sans-modern overflow-hidden">
      
      {/* Sidebar Esquerda (Navegação) */}
      <nav className="w-full md:w-24 border-r border-dark-gold/10 z-30 flex md:flex-col items-center py-6 bg-surface/60 backdrop-blur-md shadow-editorial">
        <div className="mb-8 hidden md:block">
          <Feather className="w-8 h-8 text-burnished-gold" />
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
                    <div className={`w-12 h-12 rounded-full overflow-hidden border transition-all duration-300 ${isActive ? 'border-burnished-gold scale-110 shadow-[0_0_15px_rgba(194,168,120,0.3)]' : 'border-dark-gold/30 grayscale'}`}>
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
        {/* Topbar Invisível para manter a estrutura */}
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-40 pointer-events-none px-12">
            <div className="text-xs font-bold tracking-[0.3em] uppercase pointer-events-auto text-muted-silver border-b border-dark-gold/20 pb-2"></div>
            <div className="pointer-events-auto flex items-center gap-4">
                <Search className="w-5 h-5 cursor-pointer hover:text-burnished-gold transition-colors text-muted-silver" />
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
                    <div className="flex items-center gap-3 text-burnished-gold font-sans-modern text-[10px] tracking-widest uppercase mb-6 font-medium">
                        <span className="bg-burnished-gold/10 px-2 py-1 rounded-sm border border-burnished-gold/20">{dadosAtuais.anos || "Autor Clássico"}</span>
                        <span className="w-px h-3 bg-dark-gold/40"></span>
                        <span className="text-muted-silver">{dadosAtuais.local || "Acervo"}</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif-display text-antique-white leading-[0.95] tracking-tight mb-8">
                        {dadosAtuais.nome ? dadosAtuais.nome.split(" ").slice(0, 3).map((word, i) => (
                            <span key={i} className="block">{word}</span>
                        )) : "Sem Nome"}
                    </h1>

                    <div className="relative pl-6 border-l border-burnished-gold/40">
                        <p className="text-muted-silver text-sm md:text-base leading-loose font-sans-modern line-clamp-6">
                             {loadingWiki ? "Consultando os arquivos históricos..." : dadosAtuais.bio}
                        </p>
                    </div>

                    <div className="mt-12 flex gap-12 border-t border-dark-gold/20 pt-8 w-full">
                        <div>
                            <span className="block text-4xl font-serif-display text-burnished-gold">{dadosAtuais.livros ? dadosAtuais.livros.length : 0}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-silver font-bold">Obras na Coleção</span>
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
                        {/* Shadow Editorial Profunda */}
                        <motion.div 
                            style={{ 
                                x: shadowX, 
                                y: shadowY,
                                opacity: 0.7
                            }}
                            className="absolute top-12 left-12 w-full h-full bg-black blur-3xl -z-10 rounded-sm"
                        />

                        {/* Imagem Container */}
                        <div className="relative w-full h-full rounded-sm overflow-hidden border border-dark-gold/20 bg-surface shadow-2xl">
                            <motion.img 
                                src={dadosAtuais.imagem} 
                                alt={dadosAtuais.nome}
                                className="w-full h-full object-cover object-top filter brightness-[0.8] contrast-[1.1] grayscale-[20%] group-hover:brightness-100 group-hover:grayscale-0 transition-all duration-700 ease-out"
                                onError={(e) => e.target.src = defaultImage}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-rich-charcoal/90 via-transparent to-black/10 opacity-90" />
                            
                            <div className="absolute bottom-10 left-8 right-8 z-20 transform translate-z-10">
                                <Quote className="text-burnished-gold w-8 h-8 mb-4 opacity-80" />
                                <p className="font-serif-display text-2xl md:text-3xl text-antique-white leading-tight italic text-pretty">
                                    "{dadosAtuais.citacao || (dadosAtuais.livros[0] && dadosAtuais.livros[0].titulo) || "Coleção Pessoal"}"
                                </p>
                                <div className="h-px w-16 bg-burnished-gold/50 mt-6"></div>
                            </div>

                            <motion.div 
                                style={{ background: sheenGradient, opacity: sheenOpacity }}
                                className="absolute inset-0 z-30 pointer-events-none mix-blend-plus-lighter"
                            />
                        </div>

                        {/* Borda flutuante */}
                        <motion.div 
                            style={{ translateZ: "40px" }}
                            className="absolute -inset-5 border border-burnished-gold/20 rounded-sm z-40 pointer-events-none hidden lg:block"
                        />
                    </motion.div>
                </motion.div>

            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Sidebar Direita (Livros) */}
      <aside className="hidden xl:flex w-80 border-l border-dark-gold/10 z-30 bg-surface/50 backdrop-blur-sm p-8 flex-col h-full">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-dark-gold/20">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-silver">Bibliografia Pessoal</h3>
             <Book size={14} className="text-burnished-gold/50" />
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-2">
            <div className="flex flex-col gap-4">
                {dadosAtuais && dadosAtuais.livros && dadosAtuais.livros.map((livro) => (
                    <div
                        key={`${dadosAtuais.id}-${livro.id}`}
                        className="group cursor-pointer flex gap-4 items-center p-3 rounded-sm hover:bg-rich-charcoal/40 transition-colors border border-transparent hover:border-dark-gold/20"
                    >
                        <div className="w-12 h-16 shrink-0 rounded-sm overflow-hidden shadow-md bg-surface relative">
                            <img src={livro.capa} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => e.target.src = "https://via.placeholder.com/150x200/1A1A1A/D4AF37?text=Capa"} />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-serif-display text-antique-white/90 text-sm leading-tight group-hover:text-burnished-gold transition-colors line-clamp-2">
                                {livro.titulo}
                            </h4>
                            <span className="text-[10px] text-muted-silver mt-1 font-sans-modern uppercase tracking-widest">
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
// ==================================================================================
export default function Autores() {
  const { user } = useAuth(); 
  
  const [autores, setAutores] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wikiData, setWikiData] = useState(null);
  const [loadingWiki, setLoadingWiki] = useState(false);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
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
               anos: data.description ? data.description.charAt(0).toUpperCase() + data.description.slice(1) : "Panteão Clássico", 
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

  if (loading) {
    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-muted-silver font-serif-display relative z-10">
            <div className="w-8 h-8 border-2 border-dark-gold/30 border-t-burnished-gold rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-sans-modern uppercase tracking-widest text-burnished-gold">Explorando o Acervo...</p>
        </div>
    );
  }

  if (!user) {
     return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-antique-white gap-6 relative z-10">
            <Feather size={48} className="text-burnished-gold" />
            <h2 className="font-serif-display text-4xl text-burnished-gold">Identifique-se no Arquivo</h2>
            <p className="text-muted-silver font-light max-w-md text-center">É necessário acesso para consultar o Panteão de Autores.</p>
            <Button onClick={() => window.location.href='/login'} className="bg-burnished-gold text-rich-charcoal hover:bg-antique-white mt-4">
                Entrar na Bibliotheca
            </Button>
        </div>
     );
  }

  if (autores.length === 0) {
     return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-antique-white gap-6 relative z-10">
            <div className="flex flex-col items-center gap-4 text-burnished-gold/50 mb-4">
                <Book size={56} />
            </div>
            <h2 className="font-serif-display text-4xl text-burnished-gold">Panteão Vazio</h2>
            <p className="text-muted-silver font-light max-w-md text-center">Nenhum autor foi descoberto nos seus registros ainda.</p>
            <Button onClick={() => window.location.href='/adicionar'} className="bg-burnished-gold text-rich-charcoal hover:bg-antique-white mt-4">
                Catalogar Primeira Obra
            </Button>
        </div>
     );
  }

  return (
    <div className="relative z-10">
        <AutoresView 
            autores={autores} 
            selecionado={selecionado} 
            setSelecionado={setSelecionado} 
            wikiData={wikiData} 
            loadingWiki={loadingWiki} 
        />
    </div>
  );
}