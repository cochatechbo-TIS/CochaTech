import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MenuDesplegable from './MenuDesplegable';
import { Menu, X, LogOut, User,
    LayoutDashboard, Users, List, ChartColumn, 
    Trophy, FileText, History 
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const navItems = [
    { name: 'Inicio', path: '/inicio', icon: LayoutDashboard },
    { name: 'Registro', path: '/registro', icon: Users },
    { name: 'Listas', path: '/listas', icon: List },
    { name: 'Evaluación', path: '/evaluacion', icon: ChartColumn },
    { name: 'Final', path: '/final', icon: Trophy },
    { name: 'Reportes', path: '/reportes', icon: FileText },
    { name: 'Historial', path: '/historial', icon: History }
  ];

  const handleLogout = () => {
    // Limpiar tokens del localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    
    // También puedes limpiar cookies si usas
    // document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirigir al login
    navigate('/');
    closeMobileMenu();
  };

  const handleProfile = () => {
    //navigate('/perfil');
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
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-start">
          {!isLoginPage && isMobileView && (
            <button
              className="navbar-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <span className="navbar-brand">Oh! SanSi</span>
        </div>

        {isLoginPage && (
          <div className="navbar-end">
            <button className="login-btn" onClick={() => navigate("/")}>
              <User size={18} />
              Iniciar sesión
            </button>
          </div>
        )}

        {!isLoginPage && (
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
                <span className="user-role">Rol: Administrador</span>
                <MenuDesplegable 
                  onLogout={handleLogout}
                  onProfile={handleProfile}
                />
              </div>
            )}

            {/* User Info - Mobile (siempre visible en mobile) */}
            {isMobileView && !isLoginPage && (
              <div className="user-info-mobile">
                <span className="user-role-mobile">Rol:Administrador</span>
                <MenuDesplegable 
                  onLogout={handleLogout}
                  onProfile={handleProfile}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Menú Mobile - Solo rutas distintas al login */}
{!isLoginPage && isMobileView && isMobileMenuOpen && (
  <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
    <div
      className="mobile-menu-content"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Encabezado con Oh! SanSi y Rol */}
      <div className="mobile-menu-header">
        <div className="mobile-menu-title">Oh! SanSi</div>
        <div className="user-role">Rol: Administrador</div>
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

      {/* Sección de Cerrar Sesión - Abajo y centrado */}
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