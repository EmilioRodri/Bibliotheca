import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-rich-charcoal flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burnished-gold"></div>
      </div>
    );
  }

  // Se não estiver logado, redireciona
  if (!isAuthenticated) {
    console.warn("PrivateRoute: Acesso negado. Redirecionando para login.");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}