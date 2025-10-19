// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Usa el hook

// Definimos los roles que acepta tu sistema
type Role = "administrador" | "responsable" | "evaluador";

interface ProtectedRouteProps {
  allowedRoles: Role[]; // Un array de roles permitidos para esta ruta
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 1. Mostrar "Cargando..." mientras se verifica el token
  if (isLoading) {
    return <div>Cargando sesión...</div>; // O un componente Spinner
  }

  // 2. Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si está autenticado, verificar el rol
  const userRole = user?.rol?.nombre_rol as Role;

  if (allowedRoles.includes(userRole)) {
    // 4. Si el rol es permitido, renderizar el contenido (Layout + Página)
    return <Outlet />; // Outlet renderiza los <Route> hijos
  } else {
    // 5. Si el rol no es permitido, redirigir
    // (Podrías crear una página de /no-autorizado)
    console.warn(`Acceso denegado a ${location.pathname} para el rol ${userRole}`);
    // Redirigimos a su propia página de inicio por seguridad
    switch (userRole) {
      case 'administrador':
        return <Navigate to="/administrador/inicio" replace />;
      case 'responsable':
        return <Navigate to="/responsable/inicio" replace />;
      case 'evaluador':
        return <Navigate to="/evaluador/inicio" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
};

export default ProtectedRoute;