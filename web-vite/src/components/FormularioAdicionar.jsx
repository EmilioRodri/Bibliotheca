import React, { useState } from 'react';
import StarRatingInput from './StarRatingInput.jsx';
import InputGenero from './InputGenero.jsx'; 
import { apiFetch } from '../utils/api'; 

export default function FormularioAdicionar() {
  const [formData, setFormData] = useState({
    titulo: '', autor: '', genero: '', totalPaginas: '',
    dataInicio: '', dataFim: '', classificacao: 0, 
    urlCapa: '', opiniao: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRatingChange = (newRating) => {
    setFormData((prev) => ({ ...prev, classificacao: newRating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const livroData = {
      ...formData,
      totalPaginas: formData.totalPaginas ? parseInt(formData.totalPaginas) : null,
      classificacao: formData.classificacao === 0 ? null : formData.classificacao,
      genero: formData.genero || null, 
    };
    
    try {
      const response = await apiFetch('/api/historico', { // Note o /api
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livroData),
      });
      
      if (response.ok) {
          setMessage({ type: 'success', text: 'Livro salvo com sucesso!' });
          setFormData({
            titulo: '', autor: '', genero: '', totalPaginas: '',
            dataInicio: '', dataFim: '', classificacao: 0, 
            urlCapa: '', opiniao: '',
          });
      } else {
          throw new Error('Erro ao salvar o livro.');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 bg-leitura-card border border-leitura-text-secondary rounded-md focus:outline-none focus:border-leitura-accent text-leitura-text-light";
  const labelClass = "block text-sm font-medium text-leitura-text-secondary mb-1";

  // --- LAYOUT NOVO AQUI ---
  return (
    // 1. Wrapper Externo: Ocupa toda a tela e centraliza o conteúdo
    <div className="w-full min-h-screen bg-[#1a1a1a] p-4 md:p-10 flex justify-center items-start">
        
        {/* 2. Wrapper do Formulário: Limita a largura para não esticar demais */}
        <div className="w-full max-w-4xl">
            <h1 className="font-serif-title text-3xl md:text-5xl text-leitura-accent mb-8 text-center md:text-left">
                Adicionar Novo Livro
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[#1f1f1f] p-6 md:p-8 rounded-xl shadow-2xl border border-gray-800">
            {/* Linha 1 */}
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
            
            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="genero" className={labelClass}>Gênero</label>
                    <InputGenero value={formData.genero} onChange={handleChange} />
                </div>
                <div>
                <label htmlFor="totalPaginas" className={labelClass}>Páginas</label>
                <input type="number" id="totalPaginas" value={formData.totalPaginas} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                <label className={labelClass}>Classificação</label>
                <StarRatingInput value={formData.classificacao} onChange={handleRatingChange} />
                </div>
            </div>
            
            {/* Linha 3 */}
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
            
            {/* Linha 4 */}
            <div>
                <label htmlFor="urlCapa" className={labelClass}>URL da Capa</label>
                <input type="text" id="urlCapa" value={formData.urlCapa} onChange={handleChange} className={inputClass} placeholder="https://..." />
            </div>
            
            {/* Linha 5 */}
            <div>
                <label htmlFor="opiniao" className={labelClass}>Minha Opinião</label>
                <textarea id="opiniao" rows="4" value={formData.opiniao} onChange={handleChange} className={inputClass}></textarea>
            </div>

            {/* Botão */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
                <button type="submit" disabled={loading} className="w-full md:w-auto bg-leitura-accent text-leitura-bg-dark font-bold py-3 px-8 rounded-md transition hover:bg-white disabled:opacity-50">
                {loading ? 'Salvando...' : 'Salvar Livro'}
                </button>
                {message && (
                <div className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.text}
                </div>
                )}
            </div>
            </form>
        </div>
    </div>
  );
}