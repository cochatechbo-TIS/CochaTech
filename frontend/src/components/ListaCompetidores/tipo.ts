// src/components/Lista Competidores/tipo.ts

export interface Competidor {
  id_olimpista: number;
  ci: string;
  nombre: string;
  apellidos: string;
  institucion: string;
  area: string;
  nivel: string;
  grado: string;
  contacto_tutor: string;
  id_departamento: number;
  departamento?: { nombre: string };
}

export interface Evaluador {
  id_usuario: number;
  nombre: string;
  apellidos: string;
}

export interface NivelCompetencia {
  nivel: string;
  competidores: Competidor[];
  evaluador: Evaluador | null;
  estado: "no_iniciado" | "en_proceso" | "completado";
  fases_completadas: number;
  total_fases: number;
}

export interface AreaCompetencia {
  area: string;
  responsable: string;
  niveles: NivelCompetencia[];
}

export interface ListaCompetidoresData {
  areas: AreaCompetencia[];
  total_competidores: number;
}