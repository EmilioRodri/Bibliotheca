import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Plus } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

// --- FIREBASE ---
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Configurações de API
const JAVA_RECOMMENDATION_ENDPOINT = "http://localhost:8080/api/recomendar"; 
const GOOGLE_BOOKS_API_KEY = "AIzaSyCovrCHK0kBJ20wizePd5Y6lDtLMM4x8Rc"; 

export default function Recomendacoes() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [recomendacoes, setRecomendacoes] = useState([]);
    const [meusLivrosDados, setMeusLivrosDados] = useState([]); 
    const [meusLivrosTitulos, setMeusLivrosTitulos] = useState([]); 
    const [mood, setMood] = useState('inteligente');
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchMeusLivros = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "livros"), where("uid", "==", user.uid));
                const snapshot = await getDocs(q);
                const livros = snapshot.docs.map(doc => doc.data());
                
                setMeusLivrosDados(livros);
                setMeusLivrosTitulos(livros.map(l => l.titulo.toLowerCase().trim()));
            } catch (error) {
                console.error("Erro ao carregar livros do Firebase:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeusLivros();
    }, [user]);

    const buscarCapaReal = async (livro, tentativa = 1) => {
        try {
            const queryStr = encodeURIComponent(`${livro.titulo} ${livro.autor}`);
            const url = `https://www.googleapis.com/books/v1/volumes?q=${queryStr}&maxResults=1&key=${GOOGLE_BOOKS_API_KEY}`;
            
            const response = await fetch(url);

            if ((response.status === 503 || response.status === 429) && tentativa <= 2) {
                const delay = (tentativa * 2000) + Math.random() * 1000;
                console.warn(`[Oráculo] O Google barrou a capa de "${livro.titulo}". Retentando em ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return buscarCapaReal(livro, tentativa + 1); 
            }

            if (!response.ok) return null;

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const volumeInfo = data.items[0].volumeInfo;
                if (volumeInfo.imageLinks) {
                    const img = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail;
                    return img ? img.replace('http:', 'https:') : null;
                }
            }
            return null;
        } catch (error) {
            console.error(`Falha ao buscar capa para ${livro.titulo}:`, error);
            return null;
        }
    };

    const consultarOraculo = async () => {
        if (!user) {
            window.alert("Faça login para consultar o Oráculo.");
            return;
        }
        
        setLoading(true);
        setRecomendacoes([]);
        setMotivo('');

        try {
            const perfilIA = meusLivrosDados
                .filter(l => {
                    const status = l.status ? l.status.toLowerCase() : '';
                    return status === 'lido' || (l.classificacao && l.classificacao > 0);
                })
                .map(livro => ({
                    titulo: livro.titulo,
                    autor: livro.autor,
                    classificacao: livro.classificacao,
                    status: livro.status,
                    genero: livro.genero || 'Geral'
                }));

            if (perfilIA.length === 0 && mood === 'inteligente') {
                setMotivo("Preciso de mais dados! Adicione livros lidos primeiro.");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(JAVA_RECOMMENDATION_ENDPOINT, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ perfil: perfilIA, mood: mood })
            });
            
            if (!response.ok) throw new Error("Erro no servidor Java.");

            const result = await response.json(); 
            setMotivo(result.motivoGeral); 

            const sugestoesUnicas = result.recomendacoes.filter(rec => {
                const tituloLimpo = rec.titulo.toLowerCase().trim();
                return !meusLivrosTitulos.some(meuTitulo => tituloLimpo.includes(meuTitulo) || meuTitulo.includes(tituloLimpo));
            });

            for (const rec of sugestoesUnicas) {
                const capaReal = await buscarCapaReal(rec);
                const novoLivro = {
                    ...rec,
                    urlCapa: capaReal || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400"
                };

                setRecomendacoes(prev => [...prev, novoLivro]);
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

        } catch (error) {
            console.error("Erro na consulta ao Oráculo:", error);
            setMotivo("O Oráculo encontrou uma névoa. Verifique o servidor.");
        } finally {
            setLoading(false);
        }
    };

    const adicionarAosDesejos = async (livro) => {
        if (!user) return;

        try {
            const livroParaSalvar = {
                uid: user.uid,
                titulo: livro.titulo || "Título Indisponível",
                autor: livro.autor || "Autor Desconhecido",
                status: 'QUERO_LER',
                genero: livro.genero || 'Geral',
                classificacao: 0,
                totalPaginas: 0,
                dataInicio: '',
                dataFim: '',
                urlCapa: livro.urlCapa || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400",
                motivoRecomendacao: livro.motivoRecomendacao || 'Sugerido pelo Oráculo',
                dataAdicao: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, "livros"), livroParaSalvar);
            setRecomendacoes(prev => prev.filter(l => l.titulo !== livro.titulo));
            window.alert(`"${livro.titulo}" foi adicionado aos seus desejos!`);
        } catch (error) {
            console.error("Erro ao salvar no Firestore:", error);
            window.alert("Erro ao salvar o livro.");
        }
    };

    return (
        <div className="min-h-screen text-antique-white pb-24 animate-fade-in relative">
            <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
                
                {/* CABEÇALHO */}
                <header className="text-center space-y-6 mb-12 border-b border-dark-gold/10 pb-10">
                    <div className="inline-block p-4 rounded-full border border-dark-gold/20 bg-rich-charcoal">
                        <Zap size={28} className="text-burnished-gold" />
                    </div>
                    <h1 className="font-serif-display text-5xl text-burnished-gold tracking-tight">O Oráculo</h1>
                    <p className="text-muted-silver max-w-xl mx-auto font-light text-lg">
                        Deixe que a inteligência da Bibliotheca revele sua próxima jornada literária.
                    </p>
                </header>

                {/* PAINEL DE CONTROLE - Estilo Carta/Encarte */}
                <div className="bg-surface/80 border border-dark-gold/20 p-10 rounded-sm shadow-editorial mb-16 relative">
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {[
                            { id: 'inteligente', label: ' Gosto Pessoal' },
                            { id: 'mystery', label: ' Mistério' },
                            { id: 'fantasy', label: ' Fantasia' },
                            { id: 'history', label: ' História' },
                            { id: 'science fiction', label: ' Sci-Fi' },
                            { id: 'horror', label: ' Terror' }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`px-6 py-3 rounded-sm border transition-all text-xs font-medium uppercase tracking-widest ${
                                    mood === m.id 
                                    ? 'bg-burnished-gold text-rich-charcoal border-burnished-gold' 
                                    : 'bg-transparent text-muted-silver border-dark-gold/20 hover:border-burnished-gold/50 hover:text-antique-white'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    <div className="text-center">
                        <Button 
                            onClick={consultarOraculo} 
                            disabled={loading} 
                            className={`px-14 py-4 text-lg font-serif-display rounded-sm transition-all ${loading ? 'opacity-50' : 'bg-burnished-gold text-rich-charcoal hover:bg-antique-white shadow-lg shadow-black/20'}`}
                        >
                            {loading ? 'Consultando os astros...' : 'Revelar Destino'}
                        </Button>
                    </div>
                </div>

                {/* RESULTADOS */}
                <AnimatePresence mode="wait">
                    {(loading || recomendacoes.length > 0) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            {motivo && (
                                <div className="text-center italic text-muted-silver font-serif text-lg flex items-center justify-center gap-2">
                                    <ChevronRight size={18} className="text-burnished-gold" /> {motivo}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {recomendacoes.map((livro, index) => (
                                    <motion.div 
                                        key={livro.titulo + index} 
                                        initial={{ opacity: 0, scale: 0.98 }} 
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group flex flex-col bg-surface border border-dark-gold/10 rounded-sm overflow-hidden hover:shadow-editorial hover:border-dark-gold/30 transition-all duration-500 h-full"
                                    >
                                        <div className="h-72 overflow-hidden relative bg-[#111]">
                                            <img 
                                                src={livro.urlCapa} 
                                                alt={livro.titulo} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = "https://via.placeholder.com/400x600/1A1A1A/D4AF37?text=Sem+Capa";
                                                }} 
                                            />
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="font-serif-display text-xl text-antique-white mb-2 leading-tight">{livro.titulo}</h3>
                                            <p className="text-[10px] text-burnished-gold font-bold uppercase tracking-widest mb-4">{livro.autor}</p>
                                            
                                            <p className="text-sm text-muted-silver font-light leading-relaxed line-clamp-4 mb-6 flex-grow">
                                                {livro.motivoRecomendacao}
                                            </p>
                                            
                                            <button 
                                                onClick={() => adicionarAosDesejos(livro)}
                                                className="w-full pt-4 mt-auto bg-transparent hover:text-antique-white text-muted-silver text-[10px] font-medium border-t border-dark-gold/10 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-dark-gold/30 group-hover:text-burnished-gold"
                                            >
                                                <Plus size={14} /> Adicionar aos Desejos
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}