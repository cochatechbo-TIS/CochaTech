// src/types/Evaluacion.ts
export interface Fase {
  id: number;
  nombre: string; // Ej: "Fase 1 - Clasificatoria"
  estado: string; // "Aprobada", "Rechazada", "En proceso"
}

export interface Olimpista {
  id: number;
  nombre: string;
  ci: string;
  institucion: string;
  nota?: number;
  falta_etica: boolean;
  observaciones: string;
  estado: string; // "Aprobado" | "Reprobado" | "-"
}

export interface EvaluacionResponse {
  fases: Fase[];
  olimpistas: Olimpista[];
}

export interface Evaluable {
  id: number;          // ID del Olimpista o del Equipo
  tipo: 'olimpista' | 'equipo';
  nombre: string;      // Nombre del Olimpista o del Equipo
  ci: string | null;
  institucion: string;
  integrantes: string | null; // Nombres de integrantes (solo para equipo)
  
  // Campos de evaluación
  nota: number | null;
  falta_etica: boolean;
  observaciones: string;
  estado: string;
}
export interface InfoEvaluador {
  nombre: string;
  nivel: string;
  area: string;
}
export interface EvaluacionData {
  infoEvaluador: InfoEvaluador;
  fases: Fase[];
}