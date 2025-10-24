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
