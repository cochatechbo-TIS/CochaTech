// src/interfaces/Competidor.ts
export interface Competidor {
  ci: string; // La clave primaria es el CI (string)
  nombre: string;
  apellidos: string;
  institucion: string;
  area: string;
  nivel: string;
  grado: string;
  contacto_tutor: string;
  id_departamento: number;
  departamentoNombre?: string; 
  // La relación 'departamento' que viene del backend
  departamento?: {
    id_departamento: number;
    nombre_departamento: string;
  };
}
