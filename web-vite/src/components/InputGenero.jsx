import React, { useState } from 'react';
// Removemos o import do apiFetch e o useEffect pois não vamos chamar a API agora

export default function InputGenero({ value, onChange }) {
  // Lista fixa de gêneros (Modo Offline)
  const generosSugeridos = [
    "Ficção", "Romance", "Mistério", "Fantasia", "Terror", 
    "Suspense", "Biografia", "História", "Tecnologia", 
    "Autoajuda", "Poesia", "Sci-Fi", "Aventura", "Clássicos",
    "Drama", "Policial", "HQs/Mangás"
  ];

  const labelClass = "block text-sm font-medium text-leitura-text-secondary mb-1";
  const inputClass = "w-full p-3 bg-leitura-card border border-leitura-text-secondary rounded-md focus:outline-none focus:border-leitura-accent text-leitura-text-light";

  return (
    <div>
      <label htmlFor="genero" className={labelClass}>Gênero</label>
      <input
        type="text"
        id="genero"
        value={value}
        onChange={onChange}
        className={inputClass}
        list="generos-lista"
        placeholder="Ex: Mistério"
        autoComplete="off" 
      />
      
      <datalist id="generos-lista">
        {generosSugeridos.map((genero, index) => (
          <option key={index} value={genero} />
        ))}
      </datalist>
    </div>
  );
}