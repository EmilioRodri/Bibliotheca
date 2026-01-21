import React from 'react';

export const Input = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full font-sans-modern">
      {label && (
        <label className="text-muted-silver text-sm font-medium tracking-wide ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full bg-surface border border-muted-silver/20 text-antique-white p-3 rounded-md 
                   focus:outline-none focus:border-burnished-gold focus:ring-1 focus:ring-burnished-gold/50 
                   transition-all duration-300 placeholder-muted-silver/50"
      />
    </div>
  );
};