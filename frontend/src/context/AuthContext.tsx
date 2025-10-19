// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import api from '../services/api'; // Importamos la instancia de Axios

// 1. Definir la forma del usuario (basado en tu authService)
interface User {
  id_usuario: number;
  full_name: string; // <-- OJO: Tu authService dice 'full_name'
  email: string;
  rol: {
    id_rol: number;
    nombre_rol: string; // ej: "administrador", "evaluador"
  };
}

// 2. Definir la forma del Contexto
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

// 3. Crear el Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Crear el Proveedor (Provider)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al cargar la app, intenta cargar al usuario desde localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        // Configura el token en Axios para todas las futuras peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
      // Limpia en caso de datos corruptos
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de Login
  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.access_token);
      // Configura el token en Axios para esta sesión
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      return data.user;
    } catch (error) {
      // Limpia cualquier token inválido
      delete api.defaults.headers.common['Authorization'];
      throw error; // Lanza el error para que el componente Login lo maneje
    }
  };

  // Función de Logout
  const logout = async () => {
    try {
      await authService.logout(); // Llama al logout del servicio (limpia localStorage)
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setUser(null);
      setToken(null);
      // Limpia el token de Axios
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Crear el Hook personalizado (para fácil acceso)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
