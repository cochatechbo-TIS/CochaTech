// src/pages/ResetPassword.tsx
import './login.css'; // Reutilizamos los estilos
import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import authService from '../services/authService';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>(); // Obtiene el token de la URL
  const [searchParams] = useSearchParams(); // Obtiene el email de los query params
  const email = searchParams.get('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!token || !email) {
      setError('Enlace inválido. Faltan el token o el email.');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(data.message);
      // Redirige al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000);

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

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Oh! SanSi</h2>
            <p className="login-subtitle">Restablecer Contraseña</p>
          </div>
          <div className="login-form-container">
            {message && (
              <div className="success-message">
                {message} <Link to="/login" className="success-link">Iniciar Sesión</Link>
              </div>
            )}
            {error && (
              <div className="error-message-box">
                {error}
              </div>
            )}

            {!message && ( // Oculta el formulario si ya se reseteó
              <form onSubmit={handleSubmit}>
                <p className="reset-info">
                  Ingresa tu nueva contraseña para la cuenta: <strong className="reset-email">{email}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input password-input"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password">
                      {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="••••••••"
                      className="form-input password-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
      <footer className="login-footer">
        <p>Sistema de Gestión de Olimpiadas Académicas v1.0</p>
      </footer>
    </div>
  );
};

export default ResetPassword;