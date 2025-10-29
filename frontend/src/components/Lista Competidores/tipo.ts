// ========== INTERFACES ==========
export interface Nivel {
  id: number;
  nombre: string;
  competidores: number;
  fasesAprobadas: number;
  faseTotal: number;
  evaluador: string;
}

export interface ValidacionListasProps {
  area?: string;
}