// src/pages/Login.tsx
import './login.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
// import authService from '../services/authService'; // <-- YA NO SE USA DIRECTAMENTE
import { useAuth } from '../context/AuthContext'; // <-- IMPORTAR useAuth

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- OBTENER login DEL CONTEXTO

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llama a la función login del contexto
      const user = await login(email, password);
      
      // Lee el rol desde la respuesta
      const userRole = user.rol.nombre_rol;

      // Redirige según el rol a las NUEVAS RUTAS
      switch (userRole) {
        case 'administrador':
          navigate('/administrador/inicio'); // <-- MODIFICADO
          break;
        case 'evaluador':
          navigate('/evaluador/inicio'); // <-- MODIFICADO
          break;
        case 'responsable':
          navigate('/responsable/inicio'); // <-- MODIFICADO
          break;
        default:
          navigate('/login'); // Ruta por defecto si el rol no se reconoce
      }

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ... (el resto del componente JSX es idéntico, no necesita cambios) ...
  // ... (pego el JSX para que esté completo) ...

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-card"> 
          <div className="login-header"> 
            <h2 className="login-title">Oh! SanSi</h2>
            <p className="login-subtitle">Iniciar sesión</p> 
          </div>
          <div className="login-form-container"> 
            {error && <p className="error-message-box">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="toggle-password"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión →'}
              </button>

              <p className="forgot-password">
                <Link to="/forgot-password" className="forgot-link">¿Olvidó su contraseña?</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <footer className="login-footer">
        <p>Sistema de Gestión de Olimpiadas Académicas v1.0</p>
        <p>© 2025 Sistema de Olimpiadas Académicas</p>
      </footer>
    </div>
  );
};

export default Login;