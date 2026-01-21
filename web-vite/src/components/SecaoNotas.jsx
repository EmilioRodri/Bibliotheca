import React, { useState, useEffect } from 'react';
// Importamos o 'useCallback' para otimizar o fetch
import { useCallback } from 'react';
// Importamos um ícone para o botão de excluir
import { FaTrash } from 'react-icons/fa';

// Este componente recebe o ID do livro como "prop"
export default function SecaoNotas({ livroId }) {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State para o formulário de nova nota
  const [novaNotaTexto, setNovaNotaTexto] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // --- 1. FUNÇÃO PARA BUSCAR AS NOTAS ---
  // Usamos 'useCallback' para que esta função não seja recriada
  // a menos que 'livroId' mude.
  const fetchNotas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/historico/${livroId}/notas`);
      if (!response.ok) throw new Error('Falha ao buscar notas.');
      const data = await response.json();
      setNotas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [livroId]);

  // --- 2. BUSCA AS NOTAS QUANDO O COMPONENTE CARREGA ---
  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]); // Roda a função 'fetchNotas'

  // --- 3. FUNÇÃO PARA ADICIONAR UMA NOVA NOTA ---
  const handleAdicionarNota = async (e) => {
    e.preventDefault();
    if (novaNotaTexto.trim() === '') return; // Não adiciona nota vazia

    setLoadingSubmit(true);
    try {
      const response = await fetch(`http://localhost:8080/api/historico/${livroId}/notas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // O Spring espera um JSON
        },
        // O backend espera uma String, então enviamos o texto "envelopado"
        // como uma string JSON (ex: "Este é o meu texto")
        body: JSON.stringify(novaNotaTexto) 
      });

      if (!response.ok) throw new Error('Falha ao salvar a nota.');
      
      setNovaNotaTexto(''); // Limpa o formulário
      await fetchNotas(); // Recarrega a lista de notas
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // --- 4. FUNÇÃO PARA DELETAR UMA NOTA ---
  const handleDeletarNota = async (notaId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta nota?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/historico/notas/${notaId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao excluir a nota.');
      
      await fetchNotas(); // Recarrega a lista
    } catch (err) {
      alert(err.message);
    }
  };

  // --- 5. RENDERIZAÇÃO (JSX) ---
  return (
    <div className="mt-12">
      <hr className="border-leitura-text-secondary opacity-20 my-8" />
      <h2 className="font-serif-title text-3xl text-leitura-accent mb-6">
        Minhas Citações e Notas
      </h2>
      
      {/* Formulário para adicionar nova nota */}
      <form onSubmit={handleAdicionarNota} className="mb-8">
        <textarea
          rows="4"
          value={novaNotaTexto}
          onChange={(e) => setNovaNotaTexto(e.target.value)}
          placeholder="Escreva uma citação ou nota favorita..."
          className="w-full p-3 bg-leitura-card border border-leitura-text-secondary rounded-md focus:outline-none focus:border-leitura-accent text-leitura-text-light"
        />
        <button
          type="submit"
          disabled={loadingSubmit}
          className="mt-4 bg-leitura-accent text-leitura-bg-dark font-bold py-2 px-5 rounded-md transition hover:bg-white disabled:opacity-50"
        >
          {loadingSubmit ? 'Salvando...' : 'Salvar Nota'}
        </button>
      </form>
      
      {/* Lista de notas existentes */}
      <div className="space-y-6">
        {loading && <p className="text-leitura-accent">Carregando notas...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && notas.length === 0 && (
          <p className="text-leitura-text-secondary">Nenhuma nota registrada para este livro.</p>
        )}
        
        {!loading && !error && notas.length > 0 && (
          notas.map(nota => (
            <blockquote key={nota.id} className="relative bg-leitura-card p-6 rounded-lg border-l-4 border-leitura-accent">
              <p className="text-leitura-text-light text-lg leading-relaxed italic whitespace-pre-wrap">
                "{nota.texto}"
              </p>
              <button
                onClick={() => handleDeletarNota(nota.id)}
                className="absolute top-4 right-4 text-leitura-text-secondary hover:text-red-500 transition-colors"
                title="Excluir nota"
              >
                <FaTrash />
              </button>
            </blockquote>
          ))
        )}
      </div>
    </div>
  );
}