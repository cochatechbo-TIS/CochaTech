// frontend/src/types/User.types.ts

/**
 * Representa los datos base de la tabla 'usuario' del backend.
 */
export interface BaseUser {
  id_usuario: number;
  nombre: string;
  apellidos: string;
  ci: string;
  email: string;
  telefono: string | null;
  id_rol: number;
}

/**
 * Representa a un Responsable (Usuario + campos de responsable).
 * Usado en la tabla de GestionResponsables.
 */
export interface Responsable extends BaseUser {
  area: string; // Este dato viene del 'GET /responsable'
}

/**
 * Representa a un Evaluador (Usuario + campos de evaluador).
 * Usado en la tabla de GestionEvaluadores.
 */
export interface Evaluador extends BaseUser {
  area: string;
  nivel: string | null; // El nombre del nivel
  id_nivel: number | null;
  disponible: boolean;
}

/**
 * Define el objeto de usuario que guardamos en el AuthContext.
 */
export interface AuthUser {
  id_usuario: number;
  // OJO: Tu authService usa 'full_name', pero tu backend parece enviar 'nombre' y 'apellidos'.
  // Ajusta esto según lo que realmente envíe tu AuthController.php.
  nombre: string;
  apellidos: string;
  email: string;
  rol: {
    id_rol: number;
    nombre_rol: string; // "administrador", "responsable", "evaluador"
  };
}