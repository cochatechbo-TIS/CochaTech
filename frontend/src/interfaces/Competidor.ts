// src/interfaces/Competidor.ts
export interface Competidor {
  id_olimpista: number; // <--- AÑADIDO: Clave primaria que el backend espera
  ci: string; 
  nombre: string;
  apellidos: string;
  institucion: string;
  area: string;
  nivel: string;
  grado: string;
  contacto_tutor: string;
  id_departamento: number;
  departamentoNombre?: string; 
  departamento?: {
    id_departamento: number;
    nombre_departamento: string;
  };
}