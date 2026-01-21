import React, { useEffect } from 'react';
import LivroCard from './LivroCard.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHistorico } from '../context/HistoricoContext.jsx';
import { apiFetch } from '../utils/api'; // Importe a função apiFetch

// 1. Importe o novo componente Skeleton
import LivroCardSkeleton from './LivroCardSkeleton.jsx'; 

export default function HistoricoLista() {
  const { livros, loading, error, fetchHistorico } = useHistorico();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Busca os dados do "cofre" (Context)
    // sempre que a localização (URL) mudar.
    fetchHistorico();
  }, [location, fetchHistorico]); 

  // --- Funções de Handler (o que estava resumido) ---
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este livro?")) return;
    try {
      await apiFetch(`/historico/${id}`, {
        method: 'DELETE',
      });
      
      // Atualiza a lista global
      fetchHistorico(); 
    } catch (err) {
      console.error(err.message);
      // Opcional: mostrar um erro para o usuário
    }
  };

  const handleEdit = (id) => {
    navigate(`/editar/${id}`);
  };
  // --- Fim das funções de Handler ---


  // --- Lógica de Renderização ---

  // 1. Estado de Carregamento (Mostra os "fantasmas")
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <LivroCardSkeleton />
        <LivroCardSkeleton />
        <LivroCardSkeleton />
      </div>
    );
  }

  // 2. Estado de Erro
  if (error) {
    return <p className="text-red-500 text-center">Erro: {error}</p>;
  }
  
  // 3. Estado Vazio
  if (livros.length === 0) {
    return <p className="text-leitura-text-secondary text-center">Seu histórico está vazio!</p>;
  }

  // 4. Estado de Sucesso (Renderização real)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {livros.map((livro) => (
        <LivroCard 
          key={livro.id} 
          livro={livro} 
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}