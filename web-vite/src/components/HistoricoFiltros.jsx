import React, { useState, useEffect } from 'react';

// Este componente recebe as funções para avisar a página pai (Historico)
export default function HistoricoFiltros({ onFilterChange, onClearFilters, currentSort }) {
  const [q, setQ] = useState('');
  const [genero, setGenero] = useState('');
  const [sortLocal, setSortLocal] = useState(currentSort); // Estado local para o dropdown
  const [generosSugeridos, setGenerosSugeridos] = useState([]);

  // Sincroniza o estado local se o estado pai mudar (ex: ao clicar em Limpar)
  useEffect(() => {
    setSortLocal(currentSort);
  }, [currentSort]);

  // Busca os géneros do backend para preencher o dropdown
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/historico/generos');
        if (response.ok) setGenerosSugeridos(await response.json());
      } catch (err) {
        console.error("Falha ao buscar géneros:", err);
      }
    };
    fetchGeneros();
  }, []); 

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envia os filtros para a página pai
    onFilterChange(q, genero, sortLocal);
  };

  const handleClear = () => {
    setQ('');
    setGenero('');
    setSortLocal('recente');
    onClearFilters(); // Avisa a página pai para limpar
  };

  const inputClass = "w-full p-3 bg-leitura-card border border-leitura-text-secondary rounded-md focus:outline-none focus:border-leitura-accent text-leitura-text-light";
  const labelClass = "block text-sm font-medium text-leitura-text-secondary mb-1";

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-leitura-card rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Filtro 1: Barra de Busca (Ocupa 2 colunas) */}
        <div className="md:col-span-2">
          <label htmlFor="q" className={labelClass}>Buscar por Título ou Autor</label>
          <input
            type="text"
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={inputClass}
            placeholder="Ex: Christie"
          />
        </div>

        {/* Filtro 2: Dropdown de Gênero */}
        <div>
          <label htmlFor="genero" className={labelClass}>Filtrar por Gênero</label>
          <select
            id="genero"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos os Gêneros</option>
            {generosSugeridos.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Filtro 3: Dropdown de Ordenação */}
        <div>
          <label htmlFor="sort" className={labelClass}>Ordenar por</label>
          <select
            id="sort"
            value={sortLocal}
            onChange={(e) => setSortLocal(e.target.value)}
            className={inputClass}
          >
            <option value="recente">Mais Recente</option>
            <option value="titulo_asc">Título (A-Z)</option>
            <option value="classificacao_desc">Melhor Classificação</option>
            <option value="paginas_desc">Mais Páginas</option>
            <option value="paginas_asc">Menos Páginas</option>
          </select>
        </div>
      </div>

      {/* Botões */}
      <div className="flex items-end gap-2 mt-4">
        <button
          type="submit"
          className="bg-leitura-accent text-leitura-bg-dark font-bold py-3 px-6 rounded-md transition hover:bg-white"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-leitura-text-secondary text-leitura-bg-dark font-bold py-3 px-6 rounded-md transition hover:bg-white"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}