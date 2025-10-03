import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const navItems = [
    { name: 'Inicio', path: '/inicio' }, // ya no usamos "/" porque eso será login
    { name: 'Carga Masiva', path: '/carga-masiva' },
    { name: 'Competidores', path: '/competidores' },
    { name: 'Responsables', path: '/responsables' },
    { name: 'Evaluadores', path: '/evaluadores' },
    { name: 'Medallero', path: '/medallero' },
    { name: 'Listas', path: '/listas' },
    { name: 'Validación', path: '/validacion' },
    { name: 'Reportes', path: '/reportes' }
  ];

  // Detectar cambio de tamaño de ventana
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

  // Saber si estamos en login
  const isLoginPage = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo */}
        <span className="navbar-brand">Oh! SanSi</span>

        {/* Si estamos en LOGIN */}
        {isLoginPage && (
          <div className="ml-auto">
            <button className="login-btn" onClick={() => navigate("/inicio")}>
      <User size={18} />
      Iniciar sesión
    </button>
          </div>
        )}

        {/* Si estamos en OTRA RUTA (mostrar menús normales) */}
        {!isLoginPage && (
          <>
            {/* Menu Items - Desktop */}
            {!isMobileView && (
              <div className="navbar-items">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* User Info - Desktop */}
            {!isMobileView && (
              <div className="user-info">
                <span>Administrador</span>
                <span className="user-badge">admin</span>
                <button className="logout-btn">
                  <LogOut size={16} />
                  <span>Salir</span>
                </button>
              </div>
            )}

            {/* Botón Hamburguesa - Mobile */}
            {isMobileView && (
              <button
                className="navbar-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
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
                  {item.name}
                </Link>
              ))}

              {/* User Info en mobile */}
              <div className="mobile-user-info">
                <span>Administrador</span>
                <span className="user-badge">admin</span>
                <button className="logout-btn mobile-logout">
                  <LogOut size={16} />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
