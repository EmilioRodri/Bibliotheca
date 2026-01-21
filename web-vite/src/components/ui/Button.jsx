import React from 'react';

export const Button = ({ children, variant = 'primary', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-md font-bold tracking-wide transition-all duration-300 font-sans-modern";
  
  const styles = {
    primary: "bg-burnished-gold text-rich-charcoal hover:bg-[#d4b485] hover:shadow-lg hover:shadow-burnished-gold/20",
    outline: "border border-muted-silver/40 text-muted-silver hover:border-burnished-gold hover:text-burnished-gold bg-transparent"
  };

  return (
    <button className={`${baseStyle} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};