import api from './api'; // <-- CORREGIDO: Importa 'api' en lugar de 'axios'

// La URL base ya no es necesaria aquí, porque 'api.ts' la define.

interface LoginResponse {
  access_token: string;
  user: {
    id_usuario: number; // Corregido para coincidir con tu backend
    full_name: string;
    email: string;
    rol: {
      id_rol: number;
      nombre_rol: string;
    };
  };
}

const login = async (email: string, password: string): Promise<LoginResponse> => {
  // CORREGIDO: Usa 'api.post' en lugar de 'axios.post' y una ruta relativa.
  const response = await api.post<LoginResponse>('/login', {
    email,
    password,
  });

  if (response.data.access_token) {
    localStorage.setItem('authToken', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
};

const logout = async () => {
  try {
    // Es una buena práctica llamar al endpoint de logout del backend.
    await api.post('/logout');
  } catch (error) {
    console.error("Error al cerrar sesión en el backend:", error);
  } finally {
    // Siempre limpia el localStorage, incluso si la llamada al backend falla.
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;