// ========== INTERFACES ==========
export interface Nivel {
  id: number;
  nombre: string;
  competidores: number;
  fasesAprobadas: number;
  faseTotal: number;
  evaluador: {
    id?: number;
    nombre: string;
  } | null;
}

export interface ValidacionListasProps {
  area?: string;
}