import api from './api'; 

// --- INICIO DE CORRECCIÓN ---
// Esta interfaz ahora coincide EXACTAMENTE
// con la respuesta de tu AuthController.php
// (SE ELIMINÓ LA SEGUNDA COPIA DUPLICADA)
interface AuthControllerLoginResponse {
  access_token: string;
  user: {
    id: number; // <-- Se llama 'id' en la respuesta JSON
    nombre: string;
    apellidos: string;
    email: string;
    rol: {
      id_rol: number;
      nombre_rol: string;
    };
  };
}
// --- FIN DE CORRECCIÓN ---


const login = async (email: string, password: string): Promise<AuthControllerLoginResponse> => {
  const response = await api.post<AuthControllerLoginResponse>('/login', {
    email,
    password,
  });

  if (response.data.access_token) {
    localStorage.setItem('authToken', response.data.access_token);
    // Guardamos el usuario basado en la respuesta real del AuthController
    localStorage.setItem('user', JSON.stringify(response.data.user)); 
  }

  return response.data;
};

const logout = async () => {
  try {
    // Esta llamada ahora debería funcionar al tener el 'api.ts' el token
    await api.post('/logout'); 
  } catch (error) {
    // Este log es el que veías, pero ahora no debería ocurrir
    console.error("Error al cerrar sesión en el backend:", error);
  } finally {
    // Esto se ejecuta siempre, para limpiar el frontend
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

// --- ¡INICIO DE NUEVA FUNCIONALIDAD! ---

/**
 * Solicita un enlace de reseteo de contraseña al backend.
 */
const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post('/forgot-password', { email });
  return response.data; // Devuelve el mensaje de éxito (ej: "Correo enviado")
};

/**
 * Interfaz para los datos de reseteo de contraseña.
 */
interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Envía la nueva contraseña y el token al backend.
 */
const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
  const response = await api.post('/reset-password', data);
  return response.data; // Devuelve el mensaje de éxito (ej: "Contraseña actualizada")
};
// --- ¡FIN DE NUEVA FUNCIONALIDAD! ---


const authService = {
  login,
  logout,
  getCurrentUser,
  forgotPassword, // <-- Añadido
  resetPassword,  // <-- Añadido
};

export default authService;