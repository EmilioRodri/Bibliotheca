import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa'; // Usaremos apenas a estrela cheia

// 'value' é a nota atual (ex: 3)
// 'onChange' é a função que o formulário pai nos dá para atualizar a nota
export default function StarRatingInput({ value, onChange }) {
  // 'hover' controla o efeito de "passar o mouse"
  const [hover, setHover] = useState(null);
  const totalStars = 5;

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const currentRating = index + 1;

        return (
          <label key={index} className="cursor-pointer">
            {/* Input de rádio real (escondido) */}
            <input
              type="radio"
              name="rating"
              value={currentRating}
              onClick={() => onChange(currentRating)}
              className="hidden"
            />
            {/* Estrela visível */}
            <FaStar
              size={32}
              // A estrela fica cheia se a nota (ou o hover) for maior que o índice
              color={currentRating <= (hover || value) ? '#c0a06d' : '#4a4a4a'}
              onMouseEnter={() => setHover(currentRating)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
}