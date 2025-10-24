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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h2 className="text-2xl font-bold text-center mb-2">Oh! SanSi</h2>
            <p className="text-center mb-0">Recuperar Contraseña</p>
          </div>
          <div className="p-8">
            
            {message && (
              <div className="text-green-600 bg-green-50 p-4 rounded-md text-center mb-4">
                {message}
              </div>
            )}
            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-md text-center mb-4">
                {error}
              </div>
            )}

            {!message && ( // Oculta el formulario si ya se envió el correo
              <form onSubmit={handleSubmit}>
                <p className="text-gray-600 text-sm text-center mb-4">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Correo electrónico</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.correo@ejemplo.com"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-md flex justify-center items-center hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de reseteo'}
                </button>
              </form>
            )}

            <p className="text-center text-purple-600 mt-4 text-sm">
              <Link to="/login" className="hover:underline">Volver a Iniciar Sesión</Link>
            </p>

          </div>
        </div>
      </div>
      <footer className="bg-gray-100 py-4 text-center text-gray-500 text-sm">
        <p>Sistema de Gestión de Olimpiadas Académicas v1.0</p>
      </footer>
    </div>
  );
};

export default ForgotPassword;