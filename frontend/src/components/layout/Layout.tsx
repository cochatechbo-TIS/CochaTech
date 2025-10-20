// frontend/src/components/layout/Layout.tsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom'; // <-- IMPORTANTE: Necesitamos Outlet

interface LayoutProps {
 // children prop ya no es necesaria cuando se usa como element en Route
 // children?: React.ReactNode;
 showNavbar?: boolean; // Mantenemos showNavbar por si lo usas en /login
}

const Layout: React.FC<LayoutProps> = ({ showNavbar = true }) => {
  // LOG 7: Check if Layout component renders
  console.log('[Layout] Rendering...');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* LOG 8: Confirm Navbar rendering condition */}
      {console.log(`[Layout] showNavbar is ${showNavbar}, rendering Navbar? ${showNavbar}`)}
      {showNavbar && <Navbar />}
      <main className="w-full">
        {/* LOG 9: Confirm Outlet (child route content) is about to render */}
        {console.log('[Layout] Rendering Outlet (child route)...')}
        <Outlet /> {/* <-- Renderiza el componente de la ruta hija (ej: Registro) */}
      </main>
    </div>
  );
};

export default Layout;