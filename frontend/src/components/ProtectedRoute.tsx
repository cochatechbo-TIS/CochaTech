// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('authToken');

  // Si hay un token, permite el acceso a la ruta hija.
  // Outlet es el componente que la ruta protegida debe renderizar.
  if (token) {
    return <Outlet />;
  }

  // Si no hay token, redirige al login.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;