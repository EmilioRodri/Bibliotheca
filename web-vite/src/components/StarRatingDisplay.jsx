import React from 'react';

export default function StarRatingDisplay({ rating }) {
  // Garante que o rating seja um número entre 0 e 5
  const stars = Math.max(0, Math.min(5, Number(rating) || 0));
  
  return (
    <div className="flex gap-1" title={`${stars} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          className={`text-lg ${star <= stars ? 'text-yellow-500' : 'text-gray-600'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}