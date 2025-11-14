/* eslint-disable no-irregular-whitespace */
// src/components/layout/Navbar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MenuDesplegable from './MenuDesplegable';
import { 
  Menu, X, LogOut,
  LayoutDashboard, Users, List, ChartColumn, 
  FileText, History 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // <-- IMPORTAR useAuth

// Definimos los items del menú por rol
const adminNavItems = [
  {name: 'Inicio', path: '/administrador/inicio', icon: LayoutDashboard },
  {name: 'Registro', path: '/administrador/registro', icon: Users },
  {name: 'Listas', path: '/administrador/listas', icon: List },
  {name: 'Evaluación', path: '/administrador/evaluacion', icon: ChartColumn },
  /*{name: 'Final', path: '/administrador/final', icon: Trophy },*/
  {name: 'Reportes', path: '/administrador/reportes', icon: FileText },
  {name: 'Historial', path: '/administrador/historial', icon: History }
];

const responsableNavItems = [
  { name: 'Inicio', path: '/responsable/inicio', icon: LayoutDashboard },
  { name: 'Listas', path: '/responsable/listas', icon: List },
  { name: 'Informes', path: '/responsable/informes', icon: FileText },
];

const evaluadorNavItems = [
  { name: 'Inicio', path: '/evaluador/inicio', icon: LayoutDashboard },
  { name: 'Evaluación', path: '/evaluador/evaluacion', icon: ChartColumn },
  { name: 'Informes', path: '/evaluador/informes', icon: FileText },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // <-- OBTENER USER Y LOGOUT
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Determinar qué items mostrar basado en el rol
  const [navItems, setNavItems] = useState<typeof adminNavItems>([]);
  const [userRole, setUserRole] = useState('Desconocido');

  useEffect(() => {
    if (user) {
      const role = user.rol.nombre_rol;
      setUserRole(role.charAt(0).toUpperCase() + role.slice(1)); // Pone en mayúscula: "Administrador"

      switch (role) {
        case 'administrador':
          setNavItems(adminNavItems);
          break;
        case 'responsable':
          setNavItems(responsableNavItems);
          break;
        case 'evaluador':
          setNavItems(evaluadorNavItems);
          break;
        default:
          setNavItems([]);
      }
    }
  }, [user]); // Se actualiza cada vez que el usuario cambia

  const handleLogout = () => {
    logout(); // <-- USA LA FUNCIÓN DEL CONTEXTO
    navigate('/login'); // Redirige a login
    closeMobileMenu();
  };

  const handleProfile = () => {
    //navigate('/perfil'); // Puedes implementar esto en el futuro
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

  const isActive = (path: string) => location.pathname === path;
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  // No mostramos navbar en /login
  if (location.pathname === '/login') {
    return null; 
  }

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
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-item flex items-center ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.icon && <item.icon size={20} className="navbar-icon" />}
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* User Info - Desktop */}
          {!isMobileView && (
            <div className="user-info-desktop">
              <span className="user-role">Rol: {userRole}</span> {/* <-- DINÁMICO */}
              <MenuDesplegable
                onLogout={handleLogout}
                onProfile={handleProfile}
              />
            </div>
          )}

          {/* User Info - Mobile (siempre visible en mobile) */}
          {isMobileView && (
            <div className="user-info-mobile">
              <span className="user-role-mobile">Rol: {userRole}</span> {/* <-- DINÁMICO */}
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
        <div className="user-role">Rol: {userRole}</div> {/* <-- DINÁMICO */}
      </div>
      {/* Items de navegación */}
      <div className="mobile-nav-items">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`mobile-nav-item ${
              isActive(item.path) ? 'active' : ''
            }`}
            onClick={closeMobileMenu}
          >
            {item.icon && <item.icon size={20} className="navbar-icon" />}
            {item.name}
          </Link>
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
