// ========== INTERFACES ==========
export interface Nivel {
  id: number;
  nombre: string;
  competidores: number;
  fasesAprobadas: number;
  faseTotal: number;
  evaluador: string;
  id_evaluador?: number;
  area: string;        // <-- NUEVO: nombre del área
  id_area: number;
}

export interface ValidacionListasProps {
  area?: string;
}