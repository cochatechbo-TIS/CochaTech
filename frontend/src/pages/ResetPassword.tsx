// src/pages/ResetPassword.tsx
import './login.css'; // Reutilizamos los estilos
import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h2 className="text-2xl font-bold text-center mb-2">Oh! SanSi</h2>
            <p className="text-center mb-0">Restablecer Contraseña</p>
          </div>
          <div className="p-8">
            
            {message && (
              <div className="text-green-600 bg-green-50 p-4 rounded-md text-center mb-4">
                {message} <Link to="/login" className="font-bold underline">Iniciar Sesión</Link>
              </div>
            )}
            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-md text-center mb-4">
                {error}
              </div>
            )}

            {!message && ( // Oculta el formulario si ya se reseteó
              <form onSubmit={handleSubmit}>
                <p className="text-gray-600 text-sm text-center mb-4">
                  Ingresa tu nueva contraseña para la cuenta: <strong className="text-gray-800">{email}</strong>
                </p>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-md flex justify-center items-center hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
      <footer className="bg-gray-100 py-4 text-center text-gray-500 text-sm">
        <p>Sistema de Gestión de Olimpiadas Académicas v1.0</p>
      </footer>
    </div>
  );
};

export default ResetPassword;