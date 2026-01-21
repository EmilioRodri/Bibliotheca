import React from 'react';

// Este é o "card fantasma" que pulsa
// A classe 'animate-pulse' do Tailwind faz toda a magia
export default function LivroCardSkeleton() {
  return (
    <div className="bg-leitura-card rounded-lg shadow-xl overflow-hidden animate-pulse">
      
      {/* Espaço da Imagem (h-96, igual ao card real) */}
      <div className="h-96 w-full bg-gray-700"></div>
      
      <div className="p-6">
        {/* Espaço do Título */}
        <div className="h-6 w-3/4 bg-gray-700 rounded-md mb-3"></div>
        {/* Espaço do Autor */}
        <div className="h-4 w-1/2 bg-gray-700 rounded-md mb-6"></div>
        
        {/* Espaço da Opinião (opcional) */}
        <div className="h-3 w-full bg-gray-700 rounded-md mb-2"></div>
        <div className="h-3 w-5/6 bg-gray-700 rounded-md"></div>
      </div>

      {/* Espaço dos Botões */}
      <div className="p-6 pt-0 flex gap-4">
        <div className="h-10 w-full bg-gray-700 rounded-md"></div>
        <div className="h-10 w-full bg-gray-700 rounded-md"></div>
      </div>
      
    </div>
  );
}