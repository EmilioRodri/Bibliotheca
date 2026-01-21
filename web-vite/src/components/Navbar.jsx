import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button'; 

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

  const getLinkClass = ({ isActive }) => 
    isActive 
      ? "text-burnished-gold font-bold px-3 py-2 border-b-2 border-burnished-gold transition-all duration-300"
      : "text-muted-silver hover:text-antique-white px-3 py-2 transition-all duration-300 hover:tracking-wide font-medium";

  return (
    <nav className={`sticky top-0 z-50 font-sans-modern transition-all border-b border-muted-silver/10 ${isAuthenticated ? 'bg-rich-charcoal/95 backdrop-blur-md' : 'bg-transparent py-4'}`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 relative">
          
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="font-serif-display text-2xl md:text-3xl text-burnished-gold tracking-tight hover:opacity-90 transition-opacity">
              Bibliotheca.
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-4 absolute right-0">
              <Link to="/login">
                <Button variant="outline" className="border-burnished-gold/50 text-burnished-gold hover:bg-burnished-gold hover:text-rich-charcoal px-6">
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button className="px-6 shadow-lg shadow-burnished-gold/20">
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
                  
                  <div className="h-6 w-px bg-muted-silver/20 mx-2"></div>

                  <div className="flex items-center gap-4 pl-2">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-silver uppercase tracking-widest">Leitor</span>
                        <span className="text-sm font-bold text-antique-white flex items-center gap-2">
                             {user?.email?.split('@')[0] || 'Visitante'}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface border border-burnished-gold/30 flex items-center justify-center text-burnished-gold">
                        <FaUserCircle size={20} />
                    </div>
                    <button onClick={handleLogout} title="Sair" className="text-muted-silver hover:text-red-400 transition-colors p-2">
                      <FaSignOutAlt size={18} />
                    </button>
                  </div>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="text-burnished-gold hover:text-white p-2 transition-colors">
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className={`${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-surface border-b border-muted-silver/10`}>
          <div className="px-6 pt-4 pb-8 space-y-4">
              <NavLink to="/home" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg">Home</NavLink>
              <NavLink to="/historico" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg">Histórico</NavLink>
              <NavLink to="/autores" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg">Autores</NavLink>
              <NavLink to="/recomendacoes" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg">Oráculo</NavLink>
              <NavLink to="/lista-desejos" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg">Desejos</NavLink>
              <NavLink to="/estatisticas" onClick={closeMenu} className="block text-muted-silver hover:text-burnished-gold py-2 text-lg">Estatísticas</NavLink>
              <button onClick={handleLogout} className="w-full border border-red-900/50 text-red-400 py-3 rounded text-center hover:bg-red-900/10 transition mt-4">Sair</button>
          </div>
        </div>
      )}
    </nav>
  );
}