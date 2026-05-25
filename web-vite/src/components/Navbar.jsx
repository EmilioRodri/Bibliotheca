import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button'; 
import Logo from './Logo'; // Importe a logo aqui

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth(); 
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/login');
  };

  // ESTILOS DE LINKS MAIS SUTIS E EDITORIAIS
  const getLinkClass = ({ isActive }) => 
    isActive 
      ? "text-burnished-gold font-medium px-3 py-2 border-b border-burnished-gold/50 transition-all duration-300"
      : "text-muted-silver hover:text-antique-white px-3 py-2 transition-all duration-300 font-light tracking-wide";

  return (
    <nav className={`sticky top-0 z-50 font-sans-modern transition-all border-b ${isAuthenticated ? 'bg-rich-charcoal/98 border-burnished-gold/10' : 'bg-transparent border-transparent py-4'}`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 relative">
          
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              {/* UTILIZAÇÃO DO COMPONENTE LOGO */}
              <Logo className="text-2xl md:text-3xl" showSubtitle={false} />
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-4 absolute right-0">
              <Link to="/login">
                <Button variant="outline" className="border-burnished-gold/30 text-burnished-gold hover:bg-burnished-gold hover:text-rich-charcoal font-light px-6">
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button className="px-6 bg-burnished-gold text-rich-charcoal font-medium">
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-baseline space-x-6">
                  <NavLink to="/home" className={getLinkClass}>Home</NavLink>
                  <NavLink to="/historico" className={getLinkClass}>Histórico</NavLink>
                  <NavLink to="/autores" className={getLinkClass}>Autores</NavLink>
                  <NavLink to="/recomendacoes" className={getLinkClass}>Oráculo</NavLink>
                  <NavLink to="/lista-desejos" className={getLinkClass}>Desejos</NavLink>
                  <NavLink to="/estatisticas" className={getLinkClass}>Estatísticas</NavLink>
                  <NavLink to="/estudio" className={getLinkClass}>Estúdio</NavLink>
                  
                  {/* SEPARADOR MAIS ELEGANTE */}
                  <div className="h-5 w-px bg-burnished-gold/20 mx-2"></div>

                  <div className="flex items-center gap-4 pl-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-silver uppercase tracking-[0.2em]">Leitor</span>
                        <span className="text-sm font-medium text-antique-white flex items-center gap-2">
                             {user?.email?.split('@')[0] || 'Visitante'}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-full border border-burnished-gold/30 flex items-center justify-center text-burnished-gold bg-rich-charcoal">
                        <FaUserCircle size={18} />
                    </div>
                    <button onClick={handleLogout} title="Sair" className="text-muted-silver hover:text-red-400 transition-colors p-2">
                      <FaSignOutAlt size={16} />
                    </button>
                  </div>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="text-burnished-gold hover:text-antique-white p-2 transition-colors">
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className={`${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-rich-charcoal border-b border-burnished-gold/10`}>
          <div className="px-6 pt-4 pb-8 space-y-4">
              <NavLink to="/home" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg font-light">Home</NavLink>
              <NavLink to="/historico" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg font-light">Histórico</NavLink>
              <NavLink to="/autores" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg font-light">Autores</NavLink>
              <NavLink to="/recomendacoes" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg font-light">Oráculo</NavLink>
              <NavLink to="/lista-desejos" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg font-light">Desejos</NavLink>
              <NavLink to="/estatisticas" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg font-light">Estatísticas</NavLink>
              <NavLink to="/estudio" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg font-light">Estúdio</NavLink>
              
              <div className="pt-4 mt-2 border-t border-burnished-gold/10">
                 <button onClick={handleLogout} className="w-full text-left text-muted-silver hover:text-red-400 py-2 text-lg font-light flex items-center gap-2">
                    <FaSignOutAlt size={16} /> Sair
                 </button>
              </div>
          </div>
        </div>
      )}
    </nav>
  );
}