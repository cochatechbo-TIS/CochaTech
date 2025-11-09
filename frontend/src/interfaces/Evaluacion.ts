// src/interfaces/Evaluacion.ts
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
  nombre_evaluador: string;
  nombre_nivel: string;
  nombre_area: string;
  id_nivel: number; // ID del Nivel (para "Enviar Lista")
  es_grupal: boolean;
}
export interface EvaluacionData {
  infoEvaluador: InfoEvaluador;
  fases: Fase[];
}
export interface FasePestana {
  id_nivel_fase: number; // ID Clave (para "Guardar" y "Cargar Tabla")
  nombre_fase: string;
  orden: number;
  estado: string;
}
export interface EvaluadorInicioData {
  infoEvaluador: InfoEvaluador;
  fases: FasePestana[];
}

// --- 2. Respuesta de GET /fase/{id} (Fase_Consulta_Controller) ---

// Esta es la interfaz para la tabla (reemplaza a 'Evaluable')
export interface Participante {
  id_evaluacion: number; // ¡El ID principal ahora es 'id_evaluacion'!
  
  // Datos del Olimpista (si es individual)
  nombre?: string;
  apellidos?: string;
  ci?: string;
  
  // Datos del Equipo (si es grupal)
  id_equipo?: number;
  nombre_equipo?: string;
  
  // Campos comunes
  institucion: string | null;
  nota: number | null;
  falta_etica: boolean;
  observaciones: string | null;
  estado_olimpista: string | null; // "Clasificado", "No Clasificado", etc.
}

export interface FaseConsultaData {
  fase: string;
  id_nivel_fase: number;
  nivel: string;
  area: string;
  tipo: 'individual' | 'grupal';
  es_Fase_final: boolean;
  
  // Los participantes vienen en una de estas dos claves
  resultados?: Participante[]; // Si es individual
  equipos?: Participante[];    // Si es grupal
}

// --- 3. Payload para POST /clasificacion/{id} ---

export interface EvaluacionPayload {
  id_evaluacion: number;
  nota: number;
  comentario: string;
  falta_etica: boolean;
}

export interface InfoNivelAdmin {
  nombre: string;
  area: string;
  esGrupal: boolean;
  evaluador?: string | null; // <- AGREGADO
  es_Fase_final?: boolean;
}