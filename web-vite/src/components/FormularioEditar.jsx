import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRatingInput from './StarRatingInput.jsx';
import InputGenero from './InputGenero.jsx'; // 1. Importa o novo componente
import { apiFetch } from '../utils/api'; // Importe a função apiFetch

export default function FormularioEditar() {
  // ... states permanecem iguais

  // --- HOOKS (Fetch) ---
  // Busca os dados do livro ao carregar a página
  useEffect(() => {
    const fetchLivro = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/historico/${id}`);
        const data = await response.json();
        
        // Formata os dados (converte 'null' para 'vazio' ou '0')
        const dadosFormatados = {
          ...data,
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          totalPaginas: data.totalPaginas || '',
          urlCapa: data.urlCapa || '',
          opiniao: data.opiniao || '',
          genero: data.genero || '',
          classificacao: data.classificacao || 0, // Converte 'null' para 0
        };
        setFormData(dadosFormatados);
        setLoading(false);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
        setLoading(false);
      }
    };
    fetchLivro();
  }, [id]); // Roda sempre que o 'id' (da URL) mudar

  // Função para enviar o formulário (Atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Prepara os dados para o backend
    const livroData = {
      ...formData,
      totalPaginas: formData.totalPaginas ? parseInt(formData.totalPaginas) : null,
      classificacao: formData.classificacao === 0 ? null : formData.classificacao,
      genero: formData.genero || null,
    };

    try {
      // Envia os dados para o endpoint PUT (Atualizar) - MODIFICADO
      const response = await apiFetch(`/historico/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livroData),
      });
      
      setMessage({ type: 'success', text: 'Livro atualizado com sucesso!' });
      
      // Navega de volta para o histórico após 2 segundos
      setTimeout(() => {
        navigate('/historico');
      }, 2000);

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };
  
  // --- CLASSES DE ESTILO ---
  const inputClass = "w-full p-3 bg-leitura-card border border-leitura-text-secondary rounded-md focus:outline-none focus:border-leitura-accent text-leitura-text-light";
  const labelClass = "block text-sm font-medium text-leitura-text-secondary mb-1";
  
  // --- RENDERIZAÇÃO (JSX) ---
  if (loading && !formData.titulo) {
      return <p className="text-leitura-accent text-center">Carregando dados do livro...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* --- Linha 1: Título e Autor --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="titulo" className={labelClass}>Título</label>
          <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="autor" className={labelClass}>Autor</label>
          <input type="text" id="autor" value={formData.autor} onChange={handleChange} className={inputClass} />
        </div>
      </div>
      
      {/* --- Linha 2: Gênero, Páginas, Classificação --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Componente de Gênero com Autocompletar */}
        <InputGenero 
          value={formData.genero}
          onChange={handleChange}
        />
        
        <div>
          <label htmlFor="totalPaginas" className={labelClass}>Páginas</label>
          <input type="number" id="totalPaginas" value={formData.totalPaginas} onChange={handleChange} className={inputClass} />
        </div>
        
        {/* Componente de Estrelas */}
        <div>
          <label className={labelClass}>Classificação</label>
          <StarRatingInput
            value={formData.classificacao}
            onChange={handleRatingChange}
          />
        </div>
      </div>
      
      {/* --- Linha 3: Datas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dataInicio" className={labelClass}>Data de Início</label>
          <input type="date" id="dataInicio" value={formData.dataInicio} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="dataFim" className={labelClass}>Data de Fim</label>
          <input type="date" id="dataFim" value={formData.dataFim} onChange={handleChange} className={inputClass} />
        </div>
      </div>
      
      {/* --- Linha 4: URL da Capa --- */}
      <div>
        <label htmlFor="urlCapa" className={labelClass}>URL da Capa</label>
        <input type="text" id="urlCapa" value={formData.urlCapa} onChange={handleChange} className={inputClass} placeholder="https://..." />
      </div>
      
      {/* --- Linha 5: Opinião --- */}
      <div>
        <label htmlFor="opiniao" className={labelClass}>Minha Opinião</label>
        <textarea id="opiniao" rows="4" value={formData.opiniao} onChange={handleChange} className={inputClass}></textarea>
      </div>

      {/* --- Linha 6: Botão e Feedback --- */}
      <div className="flex items-center justify-between">
        <button type="submit" disabled={loading} className="bg-leitura-accent text-leitura-bg-dark font-bold py-3 px-6 rounded-md transition hover:bg-white disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        {message && (
          <div className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </div>
        )}
      </div>
    </form>
  );
}