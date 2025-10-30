// src/pages/ForgotPassword.tsx
import './login.css'; // Reutilizamos los estilos del login
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await authService.forgotPassword(email);
      setMessage(data.message);
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
            <p className="login-subtitle">Recuperar Contraseña</p>
          </div>
          <div className="login-form-container">
            
            {message && (
              <div className="success-message">
                {message}
              </div>
            )}
            {error && (
              <div className="error-message-box">
                {error}
              </div>
            )}

            {!message && ( // Oculta el formulario si ya se envió el correo
              <form onSubmit={handleSubmit}>
                <p className="forgot-info">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.correo@ejemplo.com"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de reseteo'}
                </button>
              </form>
            )}

            <p className="back-to-login">
              <Link to="/login" className="back-link">Volver a Iniciar Sesión</Link>
            </p>

          </div>
        </div>
      </div>
      <footer className="login-footer">
        <p>Sistema de Gestión de Olimpiadas Académicas v1.0</p>
      </footer>
    </div>
  );
};

export default ForgotPassword;