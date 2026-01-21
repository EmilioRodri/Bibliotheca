import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { HistoricoProvider } from './context/HistoricoContext'; 

import './App.css';

// Componentes
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Páginas
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Adicionar from './pages/Adicionar';
import Historico from './pages/Historico';
import ListaDesejos from './pages/ListaDesejos';
import Estatisticas from './pages/Estatisticas';
import Editar from './pages/Editar';
import DetalhesLivro from './pages/DetalhesLivro';
import Landing from './pages/Landing';
import Autores from './pages/Autores';
import Recomendacoes from './pages/Recomendacoes';

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/login', '/cadastro'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-rich-charcoal text-antique-white font-sans-modern flex flex-col">
      {shouldShowNavbar && <Navbar />}
      
      <div className="w-full flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          
          <Route element={<PrivateRoute />}>
             <Route path="/home" element={<Home />} />
             <Route path="/historico" element={<Historico />} />
             <Route path="/adicionar" element={<Adicionar />} />
             <Route path="/lista-desejos" element={<ListaDesejos />} />
             <Route path="/estatisticas" element={<Estatisticas />} />
             <Route path="/autores" element={<Autores />} />
             <Route path="/recomendacoes" element={<Recomendacoes />} />
             <Route path="/editar/:id" element={<Editar />} />
             <Route path="/livro/:id" element={<DetalhesLivro />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <HistoricoProvider>
        <BrowserRouter>
           <AppContent />
        </BrowserRouter>
      </HistoricoProvider>
    </AuthProvider>
  );
}

export default App;