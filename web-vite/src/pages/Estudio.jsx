import React, { useState, useEffect } from 'react';
import { Video, Sparkles, BookOpen, PenTool, ClipboardList } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Integrações Reais
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { gerarRoteiroYoutube } from '../utils/api'; 

export default function Estudio() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [carregandoLivros, setCarregandoLivros] = useState(true);
  const [livrosLidos, setLivrosLidos] = useState([]);
  
  const [roteiroGerado, setRoteiroGerado] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    genero: 'Romance Psicológico',
    focoAnalise: '',
    tomVideo: 'Sombrio, analítico e filosófico',
    opiniaoPessoal: ''
  });

  // Busca os livros lidos no Firebase
  useEffect(() => {
    const fetchLivros = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "livros"), 
          where("uid", "==", user.uid),
          where("status", "==", "lido")
        );
        const querySnapshot = await getDocs(q);
        const livros = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLivrosLidos(livros);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
      } finally {
        setCarregandoLivros(false);
      }
    };

    fetchLivros();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Preenche o formulário ao selecionar uma obra
  const handleSelecionarLivro = (e) => {
    const livroId = e.target.value;
    if (!livroId) return;
    
    const livroSelecionado = livrosLidos.find(l => l.id === livroId);
    if (livroSelecionado) {
      setFormData(prev => ({
        ...prev,
        titulo: livroSelecionado.titulo,
        autor: livroSelecionado.autor,
        opiniaoPessoal: livroSelecionado.opiniao || 'Nenhuma anotação registrada ainda.'
      }));
    }
  };

  // Chama o Spring Boot (Gemini)
  const handleGerarRoteiro = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.focoAnalise) {
      alert("Preencha o título e o foco da análise para os oráculos trabalharem.");
      return;
    }

    setLoading(true);
    setRoteiroGerado('');

    try {
      const resultado = await gerarRoteiroYoutube(formData);
      setRoteiroGerado(resultado);
    } catch (error) {
      alert("Falha na criação do roteiro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copiarParaAreaTransferencia = () => {
    navigator.clipboard.writeText(roteiroGerado);
    alert("Manuscrito copiado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-rich-charcoal text-antique-white p-6 md:p-12 animate-fade-in font-sans pb-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-muted-silver/10 pb-8 flex items-center gap-4">
          <div className="p-4 bg-burnished-gold/10 rounded-2xl border border-burnished-gold/20">
            <Video size={36} className="text-burnished-gold" />
          </div>
          <div>
            <h1 className="font-serif-display text-4xl md:text-5xl text-burnished-gold mb-2 tracking-tight">Estúdio Cânone</h1>
            <p className="text-muted-silver font-light italic text-lg">Arquitetura de roteiros analíticos e psicológicos.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-surface/40 p-8 rounded-3xl border border-muted-silver/5 backdrop-blur-xl shadow-2xl">
              <h2 className="text-burnished-gold font-serif-display text-2xl mb-6 flex items-center gap-2">
                <PenTool size={20} />
                Diretrizes da Obra
              </h2>

              <form onSubmit={handleGerarRoteiro} className="space-y-6">
                
                {/* SELECT INTELIGENTE */}
                <div className="bg-burnished-gold/5 p-5 rounded-2xl border border-burnished-gold/10">
                  <label className="text-burnished-gold text-[10px] font-bold tracking-[0.2em] ml-1 mb-3 block uppercase flex items-center gap-2">
                    <BookOpen size={12} /> Acervo Lido
                  </label>
                  <select
                    onChange={handleSelecionarLivro}
                    className="w-full bg-rich-charcoal border border-muted-silver/10 text-antique-white p-3 rounded-xl focus:border-burnished-gold outline-none transition-colors"
                    disabled={carregandoLivros}
                  >
                    <option value="">Selecione uma obra do seu histórico...</option>
                    {livrosLidos.map(livro => (
                      <option key={livro.id} value={livro.id}>
                        {livro.titulo} - {livro.autor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col gap-2">
                     <label className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Título da Obra</label>
                     <input name="titulo" value={formData.titulo} onChange={handleChange} required className="w-full bg-rich-charcoal border border-muted-silver/10 text-antique-white p-3 rounded-xl focus:border-burnished-gold outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Autor(a)</label>
                     <input name="autor" value={formData.autor} onChange={handleChange} required className="w-full bg-rich-charcoal border border-muted-silver/10 text-antique-white p-3 rounded-xl focus:border-burnished-gold outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Gênero Dominante</label>
                     <input name="genero" value={formData.genero} onChange={handleChange} className="w-full bg-rich-charcoal border border-muted-silver/10 text-antique-white p-3 rounded-xl focus:border-burnished-gold outline-none transition-colors" placeholder="Ex: Romance Psicológico, Filosofia..." />
                  </div>
                </div>

                <div className="pt-4 border-t border-muted-silver/10">
                   <div className="flex flex-col gap-2">
                     <label className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Foco da Investigação (Pauta Principal)</label>
                     <input name="focoAnalise" value={formData.focoAnalise} onChange={handleChange} required className="w-full bg-rich-charcoal border border-muted-silver/10 text-antique-white p-3 rounded-xl focus:border-burnished-gold outline-none transition-colors" placeholder="Ex: O niilismo, a culpa..." />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Tom do Vídeo</label>
                  <select name="tomVideo" value={formData.tomVideo} onChange={handleChange} className="w-full bg-rich-charcoal border border-muted-silver/10 text-antique-white p-3 rounded-xl focus:border-burnished-gold outline-none transition-colors">
                    {/* Estilos Analíticos e Sombrios */}
                    <option value="Sombrio, analítico e filosófico">Sombrio, analítico e filosófico</option>
                    <option value="Investigação psicológica profunda">Investigação psicológica profunda</option>
                    <option value="Ácido, irônico e existencialista">Ácido, irônico e existencialista</option>
                    <option value="Melancólico e reflexivo">Melancólico e reflexivo</option>
                    <option value="Crítico, provocativo e denso">Crítico, provocativo e denso</option>
                    <option value="Ensaio visual poético e imersivo">Ensaio visual poético e imersivo</option>
                    <option value="Acadêmico e focado em contexto histórico">Acadêmico e focado em contexto histórico</option>
                    <option value="Didático e acessível (Introdução à obra)">Didático e acessível (Introdução à obra)</option>
                    
                    {/* Estilos Narrativos e de Aventura */}
                    <option value="Storytelling imersivo (Foco em contar a história)">Storytelling imersivo (Foco em contar a história)</option>
                    <option value="Aventura épica e dinâmica">Aventura épica e dinâmica</option>
                    <option value="Relato dramático e envolvente">Relato dramático e envolvente</option>
                    <option value="Conto misterioso e folclórico">Conto misterioso e folclórico</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Suas Notas & Insight Principal</label>
                    <textarea 
                        name="opiniaoPessoal" 
                        value={formData.opiniaoPessoal} 
                        onChange={handleChange} 
                        placeholder="O que mais te marcou nesta leitura? Isso será a base do argumento do vídeo..." 
                        rows={4}
                        className="w-full bg-rich-charcoal border border-muted-silver/10 text-antique-white p-4 rounded-xl focus:border-burnished-gold outline-none transition-all resize-none placeholder:text-gray-600"
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-burnished-gold text-rich-charcoal py-4 mt-4 font-bold shadow-lg shadow-burnished-gold/10 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="animate-pulse">Consultando os Oráculos...</span>
                  ) : (
                    <>
                      <Sparkles size={16} /> Estruturar Roteiro
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-surface/60 border border-burnished-gold/20 rounded-3xl p-8 min-h-[600px] shadow-2xl relative flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-muted-silver/10">
                <h3 className="text-burnished-gold font-serif-display text-2xl">Manuscrito Final</h3>
                {roteiroGerado && (
                  <button 
                    onClick={copiarParaAreaTransferencia}
                    className="flex items-center gap-2 text-xs text-muted-silver hover:text-burnished-gold transition-colors uppercase tracking-widest font-bold"
                  >
                    <ClipboardList size={16} /> Copiar Texto
                  </button>
                )}
              </div>

              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-silver/50 gap-4 opacity-50 animate-pulse">
                    <PenTool size={48} />
                    <p className="font-serif italic text-sm tracking-widest uppercase">Escrevendo roteiro...</p>
                  </div>
                ) : roteiroGerado ? (
                  <div className="text-antique-white/90 whitespace-pre-wrap leading-relaxed text-sm font-sans">
                    {roteiroGerado}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-silver/30 gap-4">
                    <Video size={64} />
                    <p className="font-serif italic text-sm tracking-widest text-center uppercase max-w-xs">
                      Selecione uma obra e forje uma nova análise
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}