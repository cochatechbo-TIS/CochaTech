// src/services/evaluacionService.ts
import api from "./api"; 
import type { 
  EvaluadorInicioData,
  FaseConsultaData,
  EvaluacionPayload,
  Participante // Importa la nueva interfaz
} from "../interfaces/Evaluacion";

/**
 * 1. OBTENER DATOS INICIALES (Info del Panel y Pestañas)
 * Llama a nuestro nuevo endpoint "pegamento".
 * * MODIFICACIÓN: Ahora acepta un idNivel opcional.
 * - Si se pasa, carga los datos de ese nivel específico.
 * - Si no se pasa, el backend carga el primer nivel por defecto.
 */
export async function getDatosInicialesEvaluador(idNivel?: number): Promise<EvaluadorInicioData> {
  // Construimos la URL dependiendo de si hay un ID seleccionado
  const url = idNivel ? `/evaluador/inicio?id_nivel=${idNivel}` : `/evaluador/inicio`;
  const response = await api.get<EvaluadorInicioData>(url);
  return response.data;
}

/**
 * 2. OBTENER PARTICIPANTES (Cargar la tabla)
 * Llama al nuevo controlador de tu compañero.
 */
export async function getParticipantesPorFase(idNivelFase: number): Promise<FaseConsultaData> {
  const response = await api.get<FaseConsultaData>(`/fase/${idNivelFase}`);
  return response.data;
}

/**
 * 3. GUARDAR Y CLASIFICAR
 * Llama al nuevo controlador 'Clasificacion'.
 * Nota: Este botón ahora hace "Guardar" y "Generar Clasificados" al mismo tiempo.
 */
export async function guardarYClasificar(
  idNivelFase: number, 
  evaluaciones: EvaluacionPayload[]
): Promise<{ message: string }> {
  
  const payload = {
    evaluaciones: evaluaciones
  };

  const response = await api.post(`/clasificacion/${idNivelFase}`, payload);
  return response.data;
}

/**
 * 4. ENVIAR LISTA (Crear Siguiente Fase)
 * Llama al nuevo controlador 'Fase_Dinamico'.
 */
export async function enviarListaYCrearSiguienteFase(
  idNivel: number 
): Promise<{ message: string }> {
  const response = await api.post(`/fase-nivel/siguiente/${idNivel}`);
  return response.data;
}