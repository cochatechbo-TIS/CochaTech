// frontend/src/components/layout/Navbar.tsx
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import MenuDesplegable from './MenuDesplegable';
import {
  Menu, X, LogOut, User, LayoutDashboard, Users, List,
  ChartColumn, Trophy, FileText, History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // <-- AÑADIDO

// Definimos la estructura de un item de navegación
interface NavItem {
  name: string;
  path: string; // <-- Esta será una ruta RELATIVA (ej: 'inicio', 'registro')
  icon: React.ElementType;
  roles: string[]; // Roles que pueden ver este link
}

// Base de datos central de TODOS los links posibles
const ALL_NAV_ITEMS: NavItem[] = [
  { name: 'Inicio', path: 'inicio', icon: LayoutDashboard, roles: ['administrador', 'responsable', 'evaluador'] },
  { name: 'Registro', path: 'registro', icon: Users, roles: ['administrador'] },
  { name: 'Listas', path: 'listas', icon: List, roles: ['administrador', 'responsable'] },
  { name: 'Evaluación', path: 'evaluacion', icon: ChartColumn, roles: ['administrador', 'evaluador'] },
  { name: 'Final', path: 'final', icon: Trophy, roles: ['administrador'] },
  { name: 'Reportes', path: 'reportes', icon: FileText, roles: ['administrador', 'responsable', 'evaluador'] }, // "Informes" es "Reportes"
  { name: 'Historial', path: 'historial', icon: History, roles: ['administrador'] },
];


const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // <-- AÑADIDO: Usa el contexto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Filtra los items del Nav basado en el rol del usuario
  const navItems = useMemo(() => {
    const userRole = user?.rol?.nombre_rol;
    if (!userRole) return [];
    return ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));
  }, [user]); // Se recalcula solo si el 'user' cambia

  const handleLogout = () => {
    logout(); // <-- AÑADIDO: Llama al logout del contexto
    navigate('/login');
    closeMobileMenu();
  };

  const handleProfile = () => {
    // navigate('/perfil'); // Futura implementación
    closeMobileMenu();
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // NavLink sabe cuándo está activo, 'isActive' manual ya no es tan necesario
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Ya no estamos en /login, estamos autenticados si vemos el Navbar
  // (Basado en la nueva estructura de App.tsx)
  const userRoleDisplay = user?.rol?.nombre_rol.charAt(0).toUpperCase() + user?.rol?.nombre_rol.slice(1);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-start">
          {isMobileView && (
            <button
              className="navbar-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <span className="navbar-brand">Oh! SanSi</span>
        </div>

        <>
          {/* Menu Items - Desktop */}
          {!isMobileView && (
            <div className="navbar-items">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path} // <-- Ruta relativa
                  className={({ isActive }) =>
                    `nav-item flex items-center ${isActive ? 'active' : ''}`
                  }
                >
                  {item.icon && <item.icon size={20} className="navbar-icon" />}
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* User Info - Desktop */}
          {!isMobileView && (
            <div className="user-info-desktop">
              {/* CORREGIDO: Rol dinámico */}
              <span className="user-role">Rol: {userRoleDisplay}</span>
              <MenuDesplegable
                onLogout={handleLogout}
                onProfile={handleProfile}
              />
            </div>
          )}

          {/* User Info - Mobile (siempre visible en mobile) */}
          {isMobileView && (
            <div className="user-info-mobile">
              {/* CORREGIDO: Rol dinámico */}
              <span className="user-role-mobile">Rol: {userRoleDisplay}</span>
              <MenuDesplegable
                onLogout={handleLogout}
                onProfile={handleProfile}
              />
            </div>
          )}
        </>
      </div>

      {/* Menú Mobile */}
      {isMobileView && isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div
            className="mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado con Oh! SanSi y Rol */}
            <div className="mobile-menu-header">
              <div className="mobile-menu-title">Oh! SanSi</div>
              {/* CORREGIDO: Rol dinámico */}
              <div className="user-role">Rol: {userRoleDisplay}</div>
            </div>
            {/* Items de navegación */}
            <div className="mobile-nav-items">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path} // <-- Ruta relativa
                  className={({ isActive }) =>
                    `mobile-nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  {item.icon && <item.icon size={20} className="navbar-icon" />}
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Sección de Cerrar Sesión */}
            <div className="mobile-logout-section">
              <button
                onClick={handleLogout}
                className="mobile-logout-btn"
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
