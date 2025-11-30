// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';


// Definimos la forma del usuario basada en tu authService y Usuario.ts
interface User {
  id_usuario: number;
  full_name: string;
  email: string;
  rol: {
    id_rol: number;
    nombre_rol: string; // <-- La clave para la autorización
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User>; // Devuelve el usuario para la redirección
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Para saber si estamos verificando el token

  useEffect(() => {
    // Comprobar si hay un usuario en localStorage al cargar la app
    try {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error al cargar usuario de localStorage:", error);
      authService.logout(); // Limpia si hay datos corruptos
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const data = await authService.login(email, pass);

    // Adaptación del formato del backend → frontend
    const userAdaptado: User = {
      id_usuario: data.user.id,
      full_name: `${data.user.nombre} ${data.user.apellidos}`,
      email: data.user.email,
      rol: data.user.rol,
    };

    setUser(userAdaptado);
    return userAdaptado; // Devuelve el formato correcto
  };


  const logout = () => {
    authService.logout(); // El servicio ya limpia localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
