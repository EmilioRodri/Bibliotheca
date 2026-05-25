import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Book, Check, X, Feather } from 'lucide-react';

import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore'; 
import { useAuth } from '../context/AuthContext';

export default function Adicionar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [termoBusca, setTermoBusca] = useState('');
  const [searching, setSearching] = useState(false);
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [exibirGaleria, setExibirGaleria] = useState(false);
  const [ultimaBuscaAutomatica, setUltimaBuscaAutomatica] = useState('');

  const GOOGLE_BOOKS_API_KEY = "AIzaSyCovrCHK0kBJ20wizePd5Y6lDtLMM4x8Rc";
  
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    urlCapa: '',
    totalPaginas: '',
    classificacao: '',
    opiniao: '',
    status: 'lendo',
    isbn: '',
    preco: '',
    dataInicio: '',
    dataFim: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tratarUrlCapa = (links) => {
    if (!links) return '';
    let url = links.extraLarge || links.large || links.medium || links.small || links.thumbnail || '';
    if (url) {
      url = url.replace('http://', 'https://');
      url = url.replace('&edge=curl', '').replace(/zoom=\d/, 'zoom=3');
    }
    return url;
  };

  const selecionarEdicao = (item) => {
    const book = item.volumeInfo;
    const sale = item.saleInfo;

    const capaAltaRes = tratarUrlCapa(book.imageLinks);

    const isbnObj = book.industryIdentifiers?.find(i => i.type === 'ISBN_13') || book.industryIdentifiers?.[0];
    const isbn = isbnObj ? isbnObj.identifier : '';

    let precoEncontrado = '';
    if (sale && sale.saleability === 'FOR_SALE' && sale.listPrice) {
        if (!sale.isEbook) {
            precoEncontrado = new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: sale.listPrice.currencyCode 
            }).format(sale.listPrice.amount);
        }
    }

    setFormData(prev => ({
      ...prev,
      titulo: book.title || '',
      autor: book.authors ? book.authors.join(', ') : '',
      totalPaginas: book.pageCount || '',
      urlCapa: capaAltaRes,
      isbn: isbn,
      preco: precoEncontrado
    }));

    setExibirGaleria(false);
    setResultadosBusca([]);
    setTermoBusca('');
  };

  const handleSearchGoogle = async () => {
    if (!termoBusca.trim()) return;
    setSearching(true);
    setExibirGaleria(false);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termoBusca)}&maxResults=8&printType=books&key=${GOOGLE_BOOKS_API_KEY}`
      );

      if (response.status === 503 || response.status === 429) {
        alert("O Arquivo Global (Google) está inacessível no momento. Tente novamente.");
        return;
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        setResultadosBusca(data.items);
        setExibirGaleria(true);
      } else {
        alert("Nenhum registro encontrado nos arquivos.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setSearching(false);
    }
  };

  const buscarCapaAvulsa = async () => {
    const tituloLimpo = formData.titulo.trim();
    if (!tituloLimpo || formData.urlCapa || tituloLimpo === ultimaBuscaAutomatica) return;

    try {
      setUltimaBuscaAutomatica(tituloLimpo);
      const termo = encodeURIComponent(`${tituloLimpo} ${formData.autor}`);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${termo}&maxResults=1&key=${GOOGLE_BOOKS_API_KEY}`
      );

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const capaAltaRes = tratarUrlCapa(data.items[0].volumeInfo.imageLinks);
        if (capaAltaRes) {
          setFormData(prev => ({ ...prev, urlCapa: capaAltaRes }));
        }
      }
    } catch (error) {
      console.warn("Falha ao buscar capa avulsa.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Sessão expirada. Identifique-se novamente.");
    
    setLoading(true);
    try {
      const novoLivro = {
        uid: user.uid,
        titulo: formData.titulo,
        autor: formData.autor,
        urlCapa: formData.urlCapa,
        totalPaginas: Number(formData.totalPaginas) || 0,
        classificacao: formData.classificacao,
        opiniao: formData.opiniao,
        status: formData.status,
        isbn: formData.isbn || '',   
        preco: formData.preco || '',
        dataInicio: formData.dataInicio || '', 
        dataFim: formData.dataFim || '',       
        paginasLidas: 0,
        dataAdicao: new Date().toISOString()
      };

      await addDoc(collection(db, "livros"), novoLivro);
      navigate(formData.status === 'lendo' ? '/home' : '/historico');
    } catch (error) {
      alert(`Erro ao selar os arquivos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ESTILOS EDITORIAIS PARA OS CAMPOS
  const labelStyle = "block text-[10px] font-bold text-muted-silver uppercase tracking-[0.2em] mb-2";
  const inputStyle = "w-full bg-transparent border-b border-dark-gold/30 px-2 py-3 text-antique-white placeholder:text-muted-silver/30 focus:outline-none focus:border-burnished-gold transition-colors font-sans-modern text-sm";
  const selectStyle = "w-full bg-transparent border-b border-dark-gold/30 px-2 py-3 text-antique-white focus:outline-none focus:border-burnished-gold transition-colors font-sans-modern text-sm cursor-pointer appearance-none";

  return (
    <div className="min-h-screen bg-transparent text-antique-white pb-24 animate-fade-in relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* CABEÇALHO */}
        <header className="mb-12 border-b border-dark-gold/20 pb-8 flex items-center gap-6">
          <div className="p-4 rounded-sm border border-dark-gold/20 bg-surface/50 shadow-editorial">
             <Feather size={32} className="text-burnished-gold" />
          </div>
          <div>
              <h1 className="font-serif-display text-5xl text-burnished-gold mb-2 tracking-tight">Catalogar Obra</h1>
              <p className="text-muted-silver font-light text-lg">Registre um novo manuscrito nas estantes do seu Acervo Pessoal.</p>
          </div>
        </header>

        {/* ÁREA DE BUSCA (Estilo Catálogo) */}
        <div className="space-y-6 mb-16">
            <div className="bg-surface/60 border border-dark-gold/20 p-8 rounded-sm flex flex-col md:flex-row gap-6 items-end shadow-editorial relative z-20">
                <div className="flex-grow w-full">
                    <label className={labelStyle}>Consulta nos Arquivos Globais</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Ex: Dostoiévski Editora 34..." 
                            className={`${inputStyle} pr-10`}
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchGoogle()}
                        />
                        <Search className="absolute right-2 top-3 text-dark-gold/60" size={18} />
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={handleSearchGoogle} 
                    disabled={searching} 
                    className="w-full md:w-auto h-[46px] px-10 bg-burnished-gold text-rich-charcoal hover:bg-antique-white transition-colors font-bold uppercase tracking-widest text-[10px] rounded-sm shadow-editorial disabled:opacity-50"
                >
                    {searching ? 'Consultando...' : 'Buscar Edição'}
                </button>
            </div>

            {/* GALERIA DE RESULTADOS */}
            <AnimatePresence>
                {exibirGaleria && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-surface/98 border border-burnished-gold/30 rounded-sm p-10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] backdrop-blur-md relative z-30"
                    >
                        <div className="flex justify-between items-center mb-10 border-b border-dark-gold/20 pb-4">
                            <h3 className="text-burnished-gold font-serif-display text-3xl">Obras Encontradas:</h3>
                            <button onClick={() => setExibirGaleria(false)} className="text-muted-silver hover:text-red-400 transition-colors p-2">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {resultadosBusca.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => selecionarEdicao(item)}
                                    className="cursor-pointer group flex flex-col"
                                >
                                    <div className="aspect-[2/3] rounded-sm overflow-hidden border border-dark-gold/20 mb-4 group-hover:border-burnished-gold shadow-editorial transition-all relative">
                                        {item.volumeInfo.imageLinks?.thumbnail ? (
                                            <img src={item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')} alt="Capa" className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all" />
                                        ) : (
                                            <div className="w-full h-full bg-rich-charcoal flex items-center justify-center text-dark-gold/40"><Book size={32} /></div>
                                        )}
                                        <div className="absolute inset-0 bg-rich-charcoal/0 group-hover:bg-rich-charcoal/40 transition-colors flex items-center justify-center">
                                            <Check className="text-burnished-gold opacity-0 group-hover:opacity-100 transition-opacity" size={40} />
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-antique-white line-clamp-1 mb-1 group-hover:text-burnished-gold transition-colors">{item.volumeInfo.title}</p>
                                    <p className="text-[9px] text-muted-silver line-clamp-1 uppercase tracking-widest">{item.volumeInfo.publisher || 'Edição Avulsa'}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* ÁREA DE PREENCHIMENTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* COLUNA ESQUERDA - PRÉVIA DA CAPA */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-px w-8 bg-dark-gold/30"></div>
                 <span className="text-muted-silver text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Selo Visual</span>
                 <div className="h-px w-8 bg-dark-gold/30"></div>
              </div>
              
              <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto lg:mx-0 bg-surface rounded-sm border border-dark-gold/20 flex items-center justify-center overflow-hidden shadow-editorial group transition-transform duration-700">
                {formData.urlCapa ? (
                  <img src={formData.urlCapa} alt="Capa" className="w-full h-full object-cover animate-fade-in filter brightness-90 contrast-110" />
                ) : (
                  <div className="text-center p-8 opacity-40 flex flex-col items-center gap-4 text-dark-gold">
                    <Book size={48} strokeWidth={1} />
                    <p className="text-[10px] font-sans-modern font-bold uppercase tracking-[0.2em]">Aguardando Registro</p>
                  </div>
                )}
              </div>
              
              <AnimatePresence>
                {(formData.isbn || formData.preco) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-surface/40 rounded-sm border border-dark-gold/10 text-[10px] uppercase tracking-widest leading-relaxed shadow-editorial">
                        {formData.isbn && <p className="text-muted-silver mb-3">ISBN: <span className="text-burnished-gold font-bold ml-2 select-all">{formData.isbn}</span></p>}
                        {formData.preco && <p className="text-muted-silver">Preço: <span className="text-antique-white font-bold ml-2">{formData.preco}</span></p>}
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUNA DIREITA - FORMULÁRIO EDITORIAL */}
          <div className="lg:col-span-8 bg-surface/50 p-10 md:p-14 rounded-sm border border-dark-gold/10 shadow-editorial">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              <div className="border-b border-dark-gold/10 pb-8">
                <label className={labelStyle}>Situação no Acervo</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`${selectStyle} text-lg text-burnished-gold`}
                >
                  <option value="lendo" className="bg-rich-charcoal">Leitura em Andamento</option>
                  <option value="lido" className="bg-rich-charcoal">Obra Finalizada</option>
                  <option value="quero-ler" className="bg-rich-charcoal">Lista de Desejos</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <label className={labelStyle}>Título da Obra *</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} onBlur={buscarCapaAvulsa} className={inputStyle} required />
                 </div>
                 <div>
                    <label className={labelStyle}>Autor(a) *</label>
                    <input type="text" name="autor" value={formData.autor} onChange={handleChange} onBlur={buscarCapaAvulsa} className={inputStyle} required />
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <label className={labelStyle}>Vínculo Visual (URL da Capa)</label>
                    <input type="text" name="urlCapa" value={formData.urlCapa} onChange={handleChange} className={inputStyle} placeholder="https://..." />
                 </div>
                 <div>
                    <label className={labelStyle}>Extensão (Páginas)</label>
                    <input type="number" name="totalPaginas" value={formData.totalPaginas} onChange={handleChange} className={inputStyle} />
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <label className={labelStyle}>Registro ISBN-13</label>
                    <input type="text" name="isbn" value={formData.isbn || ''} onChange={handleChange} className={inputStyle} />
                 </div>
                 <div>
                    <label className={labelStyle}>Valor da Edição</label>
                    <input type="text" name="preco" value={formData.preco || ''} onChange={handleChange} className={inputStyle} placeholder="R$ 0,00" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <label className={labelStyle}>Data de Início</label>
                    <input type="date" name="dataInicio" value={formData.dataInicio || ''} onChange={handleChange} className={inputStyle} />
                 </div>
                 <div>
                    <label className={labelStyle}>Data de Conclusão</label>
                    <input type="date" name="dataFim" value={formData.dataFim || ''} onChange={handleChange} className={inputStyle} />
                 </div>
              </div>

              <div className="border-t border-dark-gold/10 pt-8">
                <label className={labelStyle}>Veredito / Avaliação</label>
                <select name="classificacao" value={formData.classificacao} onChange={handleChange} className={selectStyle}>
                  <option value="" disabled className="bg-rich-charcoal text-muted-silver">Selecione uma nota...</option>
                  <option value="5" className="bg-rich-charcoal">Magnum Opus (5/5)</option>
                  <option value="4" className="bg-rich-charcoal">Excelente (4/5)</option>
                  <option value="3" className="bg-rich-charcoal">Satisfatório (3/5)</option>
                  <option value="2" className="bg-rich-charcoal">Mediano (2/5)</option>
                  <option value="1" className="bg-rich-charcoal">Expurgável (1/5)</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Anotações & Crítica Psicológica</label>
                <textarea 
                  name="opiniao" 
                  value={formData.opiniao} 
                  onChange={handleChange} 
                  rows="4"
                  className={`${inputStyle} resize-none leading-relaxed mt-2`} 
                  placeholder="Registre as luzes e sombras desta leitura..." 
                />
              </div>

              <div className="pt-8 flex flex-col md:flex-row gap-6 justify-end">
                <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-silver border border-dark-gold/20 rounded-sm hover:text-antique-white hover:border-dark-gold/60 transition-colors">
                    Descartar Registro
                </button>
                <button type="submit" disabled={loading} className="px-12 py-4 text-[10px] uppercase tracking-widest font-bold bg-burnished-gold text-rich-charcoal rounded-sm hover:bg-antique-white shadow-editorial transition-colors disabled:opacity-50">
                    {loading ? 'Selando Arquivos...' : 'Integrar à Bibliotheca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}