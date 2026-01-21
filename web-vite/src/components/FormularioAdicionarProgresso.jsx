import React, { useState } from 'react';

export default function FormularioAdicionarProgresso({ onLivroAdicionado }) {
  // 1. DECLARAÇÃO DOS ESTADOS (Variáveis) - Essencial para evitar o "ReferenceError"
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [urlCapa, setUrlCapa] = useState('');
  const [totalPaginas, setTotalPaginas] = useState('');
  const [prazoDias, setPrazoDias] = useState(''); 
  
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // 2. FUNÇÃO DE BUSCA (Open Library)
  const handleSearch = async () => {
    if (!titulo) {
      setSearchError('Por favor, digite um título para buscar.');
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(titulo)}&limit=1`
      );
      if (!response.ok) throw new Error('Falha ao buscar na Open Library.');
      
      const data = await response.json();
      if (!data.docs || data.docs.length === 0) {
        throw new Error('Nenhum livro encontrado com esse título.');
      }

      const book = data.docs[0];

      setAutor(book.author_name ? book.author_name.join(', ') : 'Autor desconhecido');
      setTotalPaginas(book.number_of_pages_median ? book.number_of_pages_median.toString() : '');
      
      if (book.cover_i) {
        const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
        setUrlCapa(coverUrl);
      } else {
        setUrlCapa('');
      }

    } catch (err) {
      setSearchError(err.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  // 3. FUNÇÃO: ADICIONAR AO PROGRESSO
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prazoDias) {
      alert("Por favor, preencha o prazo (em dias).");
      return;
    }
    setLoadingForm(true);

    const novoLivro = {
      titulo, autor, urlCapa,
      totalPaginas: parseInt(totalPaginas),
      prazoDias: parseInt(prazoDias)
    };
    
    try {
      // Substitua pela função apiFetch se você já a criou, 
      // senão use o fetch padrão (que precisa do token para funcionar se a auth estiver ativa)
      const response = await fetch('http://localhost:8080/api/progresso', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // Adicione o token se já tiver o sistema de auth a funcionar:
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify(novoLivro)
      });
      
      if (!response.ok) throw new Error('Falha ao salvar.');

      onLivroAdicionado();
      
      // Limpa o formulário
      setTitulo(''); setAutor(''); setUrlCapa(''); setTotalPaginas(''); setPrazoDias('');
    } catch (err) { 
      alert("Falha ao adicionar livro. (Verifique se está logado)");
      console.error(err);
    } 
    finally { setLoadingForm(false); }
  };

  // 4. FUNÇÃO: ADICIONAR À LISTA DE DESEJOS
  const handleAddToWishlist = async () => {
    if (!titulo || !autor) {
        alert("Busque um livro primeiro (Título e Autor são necessários).");
        return;
    }
    setLoadingWishlist(true);

    const livroDesejado = {
      titulo: titulo,
      autor: autor,
      urlCapa: urlCapa,
      totalPaginas: totalPaginas ? parseInt(totalPaginas) : null,
    };

    try {
      const response = await fetch('http://localhost:8080/api/desejos', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(livroDesejado)
      });
      if (!response.ok) throw new Error('Falha ao adicionar na lista de desejos.');
      
      alert(`"${titulo}" foi adicionado à sua Lista de Desejos!`);
      setTitulo(''); setAutor(''); setUrlCapa(''); setTotalPaginas(''); setPrazoDias('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const inputClass = "w-full p-3 bg-leitura-card border border-leitura-text-secondary rounded-md focus:outline-none focus:border-leitura-accent text-leitura-text-light";
  const labelClass = "block text-sm font-medium text-leitura-text-secondary mb-1";

  // 5. RENDERIZAÇÃO (JSX)
  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-leitura-card rounded-lg shadow-lg">
      <h3 className="font-serif-title text-2xl text-leitura-accent mb-4">Iniciar Nova Leitura</h3>
      
      <div className="mb-4">
        <label htmlFor="titulo" className={labelClass}>Título</label>
        <div className="flex gap-2">
          <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} required />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loadingSearch}
            className="flex-shrink-0 bg-leitura-text-secondary text-leitura-bg-dark font-bold py-3 px-5 rounded-md transition hover:bg-leitura-accent disabled:opacity-50"
          >
            {loadingSearch ? '...' : 'Buscar'}
          </button>
        </div>
        {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="autor" className={labelClass}>Autor</label>
          <input type="text" id="autor" value={autor} onChange={(e) => setAutor(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="urlCapa" className={labelClass}>URL da Capa</label>
          <input type="text" id="urlCapa" value={urlCapa} onChange={(e) => setUrlCapa(e.target.value)} className={inputClass} placeholder="Preenchido pela busca..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalPaginas" className={labelClass}>Total de Páginas</label>
          <input type="number" id="totalPaginas" value={totalPaginas} onChange={(e) => setTotalPaginas(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="prazoDias" className={labelClass}>Prazo (em dias)</label>
          <input 
            type="number" 
            id="prazoDias" 
            value={prazoDias} 
            onChange={(e) => setPrazoDias(e.target.value)} 
            className={inputClass}
            placeholder="Obrigatório para 'Começar a Ler'"
          />
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <button 
          type="submit"
          disabled={loadingForm || loadingWishlist} 
          className="flex-1 bg-leitura-accent text-leitura-bg-dark font-bold py-3 px-6 rounded-md transition hover:bg-white disabled:opacity-50"
        >
          {loadingForm ? 'Adicionando...' : 'Começar a Ler'}
        </button>
        <button 
          type="button"
          onClick={handleAddToWishlist}
          disabled={loadingForm || loadingWishlist}
          className="flex-1 bg-leitura-text-secondary text-leitura-bg-dark font-bold py-3 px-6 rounded-md transition hover:bg-white disabled:opacity-50"
        >
          {loadingWishlist ? 'Salvando...' : 'Adicionar à Lista de Desejos'}
        </button>
      </div>
    </form>
  );
}