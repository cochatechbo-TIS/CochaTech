// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- USAR EL CONTEXTO

// Definimos una página de carga simple
const LoadingScreen = () => (
  <div className="flex justify-center items-center min-h-screen">
    <p>Cargando...</p>
  </div>
);

interface ProtectedRouteProps {
  allowedRoles: string[]; // Un array de roles permitidos, ej: ['administrador']
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />; // Muestra "Cargando..." mientras se verifica el token
  }

  if (!user) {
    // 1. No autenticado -> Redirige a login
    return <Navigate to="/login" replace />;
  }

  const userRole = user.rol.nombre_rol;

  if (allowedRoles.includes(userRole)) {
    // 2. Autenticado y Autorizado -> Muestra el contenido (Outlet)
    return <Outlet />;
  }

  // 3. Autenticado pero No Autorizado -> Redirige a su dashboard principal
  // Esto previene que un evaluador entre a rutas de admin
  switch (userRole) {
    case 'administrador':
      return <Navigate to="/administrador/inicio" replace />;
    case 'evaluador':
      return <Navigate to="/evaluador/inicio" replace />;
    case 'responsable':
      return <Navigate to="/responsable/inicio" replace />;
    default:
      // Si el rol es desconocido, lo saca
      return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;