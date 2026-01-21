import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Plus, User, Star } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

// --- FIREBASE ---
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Endpoint do Java
const JAVA_RECOMMENDATION_ENDPOINT = "http://localhost:8080/api/recomendar"; 

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

    const buscarCapaReal = async (livro) => {
        try {
            const query = encodeURIComponent(`${livro.titulo} ${livro.autor}`);
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
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
            console.warn(`Não foi possível achar capa para: ${livro.titulo}`);
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
                setMotivo("Preciso de mais dados! Adicione livros lidos no seu Histórico primeiro.");
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
            
            if (!response.ok) {
                const erroTexto = await response.text();
                throw new Error(`Erro ${response.status}: ${erroTexto}`);
            }

            const result = await response.json(); 
            
            if (!result.recomendacoes) {
                 throw new Error("Formato inválido recebido do Oráculo.");
            }

            const sugestoesUnicas = result.recomendacoes.filter(rec => {
                const tituloLimpo = rec.titulo.toLowerCase().trim();
                return !meusLivrosTitulos.some(meuTitulo => tituloLimpo.includes(meuTitulo) || meuTitulo.includes(tituloLimpo));
            });

            const sugestoesComCapasReais = await Promise.all(
                sugestoesUnicas.map(async (rec) => {
                    const capaReal = await buscarCapaReal(rec);
                    return {
                        ...rec,
                        urlCapa: capaReal || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop"
                    };
                })
            );

            setRecomendacoes(sugestoesComCapasReais);
            setMotivo(result.motivoGeral); 

        } catch (error) {
            console.error("Erro na consulta ao Oráculo:", error);
            setMotivo("O Oráculo encontrou uma névoa. Verifique se o servidor Java está rodando.");
        } finally {
            setLoading(false);
        }
    };

    const adicionarAosDesejos = async (livro) => {
        if (!user) {
            window.alert("Faça login para salvar livros.");
            return;
        }

        try {
            const novoLivro = {
                uid: user.uid,
                titulo: livro.titulo,
                autor: livro.autor,
                status: 'QUERO_LER',
                genero: 'Recomendação',
                classificacao: 0,
                totalPaginas: 0,
                dataInicio: '',
                dataFim: '',
                urlCapa: livro.urlCapa,
                motivoRecomendacao: livro.motivoRecomendacao || '',
                dataAdicao: new Date().toISOString()
            };

            await addDoc(collection(db, "livros"), novoLivro);

            if(window.confirm(`"${livro.titulo}" salvo! Ir para sua lista de desejos agora?`)) {
                navigate('/historico', { state: { filtro: 'QUERO_LER' } });
            } else {
                setMeusLivrosTitulos(prev => [...prev, livro.titulo.toLowerCase()]);
                setRecomendacoes(prev => prev.filter(l => l.titulo !== livro.titulo));
            }

        } catch (error) {
            console.error("Erro ao salvar:", error);
            window.alert("Erro ao salvar o livro. Tente novamente.");
        }
    };

    // --- ESTILOS PADRONIZADOS (HOME/HISTORICO) ---
    return (
        <div className="min-h-screen bg-rich-charcoal text-antique-white font-sans selection:bg-burnished-gold selection:text-rich-charcoal pb-24 animate-fade-in">
            
            {/* Background Texture (sutil e elegante) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-burnished-gold/5 to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
                
                <header className="text-center space-y-6 mb-12 border-b border-muted-silver/10 pb-10">
                    <div className="inline-block p-3 rounded-full bg-burnished-gold/10 border border-burnished-gold/30 mb-2">
                        <Zap size={32} className="text-burnished-gold" />
                    </div>
                    <h1 className="font-serif-display text-5xl md:text-6xl text-burnished-gold tracking-tight">
                        O Oráculo de Livros
                    </h1>
                    <p className="text-muted-silver text-lg max-w-xl mx-auto font-light">
                        Deixe que a inteligência da Bibliotheca analise seus hábitos de leitura e revele sua próxima jornada literária.
                    </p>
                </header>

                {/* Card de Configuração (Estilo Surface) */}
                <div className="bg-surface border border-muted-silver/10 p-8 rounded-xl shadow-xl mb-16">
                    <p className="text-xs text-center text-burnished-gold uppercase tracking-widest mb-6 font-bold">Modo de Consulta</p>
                    
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {[
                            { id: 'inteligente', label: '🧠 Baseado no meu Gosto' },
                            { id: 'mystery', label: '🕵️ Mistério' },
                            { id: 'fantasy', label: '🐉 Fantasia' },
                            { id: 'history', label: '🏛️ História' },
                            { id: 'science fiction', label: '🚀 Sci-Fi' },
                            { id: 'horror', label: '👻 Terror' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setMood(item.id)}
                                className={`px-5 py-3 rounded-md border transition-all duration-300 text-sm font-bold uppercase tracking-wide ${
                                    mood === item.id 
                                    ? 'bg-burnished-gold text-rich-charcoal border-burnished-gold shadow-lg shadow-burnished-gold/20 scale-105' 
                                    : 'bg-transparent text-muted-silver border-muted-silver/20 hover:border-burnished-gold/50 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="text-center">
                        <Button 
                            onClick={consultarOraculo} 
                            disabled={loading} 
                            className={`px-12 py-4 text-lg shadow-xl hover:scale-[1.02] transition-transform w-full md:w-auto font-serif-display ${loading ? 'bg-rich-charcoal/50 text-muted-silver cursor-not-allowed border border-muted-silver/10' : 'bg-burnished-gold text-rich-charcoal shadow-burnished-gold/20'}`}
                        >
                            {loading ? 'Consultando os astros...' : 'Revelar Destino'}
                        </Button>
                        <p className="mt-4 text-xs text-muted-silver/50 uppercase tracking-widest">
                            {meusLivrosDados.length} livros analisados da sua coleção
                        </p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20 text-burnished-gold/80 text-xl font-serif-display">
                            <div className="w-10 h-10 border-4 border-burnished-gold/30 border-t-burnished-gold rounded-full animate-spin mx-auto mb-6"></div>
                            {motivo || "O Oráculo está folheando o destino..."}
                        </motion.div>
                    )}

                    {recomendacoes.length > 0 && !loading && (
                        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-10">
                            <div className="flex items-center justify-center">
                                <div className="bg-surface px-6 py-4 rounded-full w-fit mx-auto border border-burnished-gold/20 shadow-lg">
                                    <p className="text-center text-antique-white font-serif text-lg italic flex items-center gap-3">
                                        <ChevronRight size={20} className="text-burnished-gold" /> {motivo}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {recomendacoes.map((livro, index) => (
                                    <motion.div 
                                        key={livro.titulo} 
                                        initial={{ opacity: 0, scale: 0.95 }} 
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.15 }}
                                        className="group relative flex flex-col bg-surface rounded-lg border border-muted-silver/10 overflow-hidden hover:shadow-2xl hover:shadow-burnished-gold/10 transition-all hover:-translate-y-1 h-full"
                                    >
                                        <div className="h-72 overflow-hidden relative bg-rich-charcoal">
                                            <img 
                                                src={livro.urlCapa} 
                                                alt={livro.titulo} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                                                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400"} 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-rich-charcoal via-transparent to-transparent opacity-80"></div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow relative">
                                            {/* Tag Flutuante */}
                                            <div className="absolute top-4 right-4 bg-rich-charcoal/80 backdrop-blur-sm p-1.5 rounded-full border border-burnished-gold/30">
                                                <Star size={14} className="text-burnished-gold fill-burnished-gold" />
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="font-serif-display text-xl text-antique-white leading-tight mb-1 group-hover:text-burnished-gold transition-colors">
                                                    {livro.titulo}
                                                </h3>
                                                <p className="text-xs text-muted-silver font-bold uppercase tracking-wider">{livro.autor}</p>
                                            </div>
                                            
                                            <p className="text-sm text-gray-400 line-clamp-4 mb-6 font-light leading-relaxed flex-grow">
                                                {livro.motivoRecomendacao}
                                            </p>

                                            <button 
                                                onClick={() => adicionarAosDesejos(livro)}
                                                className="w-full py-3 mt-auto bg-rich-charcoal hover:bg-burnished-gold hover:text-rich-charcoal text-xs font-bold rounded border border-muted-silver/20 text-muted-silver hover:border-burnished-gold transition-all uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-burnished-gold/30"
                                            >
                                                <Plus size={16} /> Adicionar aos Desejos
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {recomendacoes.length === 0 && !loading && motivo && (
                        <motion.div key="no-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 text-muted-silver font-serif">
                            <User size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-xl max-w-md mx-auto text-antique-white">{motivo}</p>
                            <p className="mt-4 text-sm text-gray-500">Tente mudar o modo de consulta ou adicione mais livros à sua biblioteca.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}