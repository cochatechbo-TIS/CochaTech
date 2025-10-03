// src/pages/Login.tsx
import './login.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import LoginHeader from '../components/layout/LoginHeader';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('El correo electrónico es obligatorio');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('La contraseña es obligatoria');
      setLoading(false);
      return;
    }

    console.log('Intentando login con:', { email, password });
    setTimeout(() => {
      if (email === 'admin@ejemplo.com' && password === 'admin') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('role', 'admin');
        navigate('/inicio');
      } else if (email === 'evaluador@ejemplo.com' && password === 'evaluador') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('role', 'evaluador');
        navigate('/evaluadores');
      } else {
        setError('Credenciales inválidas');
      }
      setLoading(false);
    }, 1000);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LoginHeader />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md"> {/* Mantengo rounded-lg y shadow-md aquí */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg"> {/* Nuevo div para cuadro azul del título */}
            <h2 className="text-2xl font-bold text-center mb-2">Oh! SanSi</h2>
            <p className="text-center mb-0">Iniciar sesión (RFS)</p> {/* Removí mb-8 para ajustar espacio */}
          </div>
          <div className="p-8"> {/* Contenido del formulario en padding separado */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm font-medium">Correo electrónico</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin@ejemplo.com"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm font-medium">Contraseña</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-md flex justify-center items-center hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión →'}
              </button>

              <p className="text-center text-purple-600 mt-4 text-sm">
                <Link to="/forgot-password" className="hover:underline">¿Olvidó su contraseña?</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <footer className="bg-gray-100 py-4 text-center text-gray-500 text-sm">
        <p>Sistema de Gestión de Olimpiadas Académicas v1.0</p>
        <p className="mt-1">© 2025 Sistema de Olimpiadas Académicas</p>
      </footer>
    </div>
  );
};

export default Login;