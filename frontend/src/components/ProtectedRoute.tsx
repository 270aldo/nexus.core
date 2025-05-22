import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'utils/auth-context';

export interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Verificar si estamos en la página de login o signup para evitar redireccionamiento infinito
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/database-setup';
  
  if (loading) {
    // You can show a loading spinner here if you want
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-mono">Loading...</div>
      </div>
    );
  }

  // Si no hay usuario autenticado y no estamos en una página de autenticación, redirigir
  if (!user && !isAuthPage) {
    console.log('No user authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
