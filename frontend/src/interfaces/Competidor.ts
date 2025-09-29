export interface Competidor {
  id_olimpista: number;
  ci: string;
  nombre: string;
  institucion: string;
  area: string;
  nivel: string;
  grado: string;
  contacto_tutor: string;
  id_departamento: number;

  // Relación del backend
  departamento?: {
    id_departamento: number;
    nombre_departamento: string;
  };

  // Campos que usaremos en frontend
  documento?: string;
  gradoEscolaridad?: string;
  contactoTutor?: string;

  // SOLO un string para mostrar en inputs/selects
  departamentoNombre?: string; 
}
