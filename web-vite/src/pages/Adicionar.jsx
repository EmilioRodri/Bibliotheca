import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';

import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore'; 
import { useAuth } from '../context/AuthContext';

export default function Adicionar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [termoBusca, setTermoBusca] = useState('');
  const [searching, setSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    urlCapa: '',
    totalPaginas: '',
    classificacao: '',
    opiniao: '',
    status: 'lendo',
    isbn: '',        // Campo Novo
    preco: '',       // Campo Novo
    dataInicio: '',  // NOVO: Data de Início
    dataFim: ''      // NOVO: Data de Fim
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchGoogle = async () => {
    if (!termoBusca.trim()) return;
    setSearching(true);

    try {
      // Busca aumentando o limite para tentar achar a versão física correta
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termoBusca)}&maxResults=5&printType=books`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        // --- LÓGICA INTELIGENTE DE SELEÇÃO ---
        // Tenta encontrar o primeiro livro que tenha ISBN-13 (Capa comum/dura)
        let melhorResultado = data.items.find(item => 
            item.volumeInfo.industryIdentifiers?.some(id => id.type === 'ISBN_13')
        );

        // Se não achar nenhum com ISBN-13, pega o primeiro da lista mesmo
        if (!melhorResultado) melhorResultado = data.items[0];

        const book = melhorResultado.volumeInfo;
        const sale = melhorResultado.saleInfo;

        let capa = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || '';
        capa = capa.replace('http://', 'https://'); 

        // Extração Robusta do ISBN-13
        const isbnObj = book.industryIdentifiers?.find(i => i.type === 'ISBN_13') || book.industryIdentifiers?.[0];
        const isbn = isbnObj ? isbnObj.identifier : '';

        // Extração de Preço
        let precoEncontrado = '';
        if (sale && sale.saleability === 'FOR_SALE' && sale.listPrice) {
            // Se for E-book, ignoramos o preço automático para evitar confusão com preço físico
            if (!sale.isEbook) {
                precoEncontrado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: sale.listPrice.currencyCode }).format(sale.listPrice.amount);
            }
        }

        setFormData(prev => ({
          ...prev,
          titulo: book.title || '',
          autor: book.authors ? book.authors[0] : '',
          totalPaginas: book.pageCount || '',
          urlCapa: capa,
          isbn: isbn,
          preco: precoEncontrado // Será vazio se for E-book
        }));
      } else {
        alert("Nenhum livro encontrado na base do Google.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Erro ao conectar com o Google Books.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Você precisa estar logado.");
    
    setLoading(true);
    try {
      const novoLivro = {
        uid: user.uid,
        titulo: formData.titulo,
        autor: formData.autor,
        urlCapa: formData.urlCapa,
        totalPaginas: formData.totalPaginas,
        classificacao: formData.classificacao,
        opiniao: formData.opiniao,
        status: formData.status,
        isbn: formData.isbn || '',   
        preco: formData.preco || '',
        dataInicio: formData.dataInicio || '', // Salva data de inicio
        dataFim: formData.dataFim || '',       // Salva data de fim 
        paginasLidas: 0,
        dataAdicao: new Date().toISOString()
      };

      await addDoc(collection(db, "livros"), novoLivro);
      
      if (formData.status === 'lendo') {
          navigate('/home');
      } else {
          navigate('/historico');
      }
    } catch (error) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rich-charcoal text-antique-white p-6 md:p-12 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b border-muted-silver/20 pb-6">
          <h1 className="font-serif-display text-4xl text-burnished-gold mb-2">Catalogar Nova Obra</h1>
          <p className="text-muted-silver font-light">Busca otimizada para edições físicas (ISBN-13).</p>
        </header>

        <div className="bg-surface/30 border border-burnished-gold/20 p-6 rounded-xl mb-10 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow w-full">
                <label className="text-burnished-gold text-xs font-bold tracking-widest ml-1 mb-2 block uppercase">Busca Automática</label>
                <input 
                    type="text" 
                    placeholder="Digite o nome do livro ou ISBN..." 
                    className="w-full bg-rich-charcoal border border-muted-silver/30 text-antique-white p-3 rounded-md focus:border-burnished-gold focus:outline-none"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchGoogle()}
                />
            </div>
            <Button type="button" onClick={handleSearchGoogle} disabled={searching} className="w-full md:w-auto min-w-[150px]">
                {searching ? 'Buscando...' : '🔍 Buscar Dados'}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Preview */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-24">
              <span className="block text-muted-silver text-xs font-bold uppercase mb-3 tracking-widest text-center lg:text-left">Capa</span>
              <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto lg:mx-0 bg-surface rounded-lg border-2 border-dashed border-muted-silver/30 flex items-center justify-center overflow-hidden shadow-2xl shadow-black/50">
                {formData.urlCapa ? (
                  <img src={formData.urlCapa} alt="Capa" className="w-full h-full object-cover animate-fade-in" onError={(e) => {e.target.style.display='none'}} />
                ) : (
                  <div className="text-center p-6 text-muted-silver/50"><p className="text-sm font-serif-display italic">A capa aparecerá aqui</p></div>
                )}
              </div>
              
              {/* Dados Extras */}
              {(formData.isbn || formData.preco) && (
                  <div className="mt-4 p-4 bg-surface rounded border border-muted-silver/10 text-sm animate-fade-in">
                      {formData.isbn && <p className="text-muted-silver mb-1">ISBN-13: <span className="text-white font-mono select-all">{formData.isbn}</span></p>}
                      <p className="text-xs text-muted-silver/60">Este código garante o link para o livro físico na Amazon.</p>
                  </div>
              )}
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2 bg-surface/50 p-8 rounded-xl border border-muted-silver/10 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-burnished-gold/10 p-4 rounded-lg border border-burnished-gold/30">
                <label className="text-burnished-gold text-sm font-bold tracking-wide ml-1 mb-2 block uppercase">
                  Status da Leitura
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-rich-charcoal border border-burnished-gold/50 text-white p-3 rounded-md focus:border-burnished-gold cursor-pointer"
                >
                  <option value="lendo">📖 Lendo Atualmente</option>
                  <option value="lido">✅ Leitura Concluída</option>
                  <option value="quero-ler">🌟 Quero Ler (Desejos)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Título" name="titulo" value={formData.titulo} onChange={handleChange} required />
                <Input label="Autor" name="autor" value={formData.autor} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="URL da Capa" name="urlCapa" value={formData.urlCapa} onChange={handleChange} />
                <Input label="Páginas" name="totalPaginas" type="number" value={formData.totalPaginas} onChange={handleChange} />
              </div>
              
              {/* Campos para ISBN e Preço (Editáveis) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input label="ISBN (Físico)" name="isbn" value={formData.isbn || ''} onChange={handleChange} placeholder="978..." />
                 <Input label="Preço Pago/Estimado" name="preco" value={formData.preco || ''} onChange={handleChange} placeholder="R$ 0,00" />
              </div>

              {/* NOVOS CAMPOS: DATAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input label="Data Início" name="dataInicio" type="date" value={formData.dataInicio || ''} onChange={handleChange} />
                 <Input label="Data Término" name="dataFim" type="date" value={formData.dataFim || ''} onChange={handleChange} />
              </div>

              <div className="flex flex-col gap-2 font-sans-modern">
                <label className="text-muted-silver text-sm font-medium tracking-wide ml-1">Classificação</label>
                <select name="classificacao" value={formData.classificacao} onChange={handleChange} className="w-full bg-surface border border-muted-silver/20 text-antique-white p-3 rounded-md focus:border-burnished-gold">
                  <option value="" disabled>Selecione...</option>
                  <option value="5">⭐⭐⭐⭐⭐ - Excelente</option>
                  <option value="4">⭐⭐⭐⭐ - Muito Bom</option>
                  <option value="3">⭐⭐⭐ - Bom</option>
                  <option value="2">⭐⭐ - Regular</option>
                  <option value="1">⭐ - Ruim</option>
                </select>
              </div>
              <TextArea label="Resenha / Anotações" name="opiniao" value={formData.opiniao} onChange={handleChange} />
              <div className="pt-6 flex gap-4 justify-end border-t border-muted-silver/10 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}