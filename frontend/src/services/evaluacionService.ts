// src/services/evaluacionService.ts
import api from "./api"; // usa tu instancia axios ya configurada en src/services/api.ts
import type { Fase, Olimpista } from "../interfaces/Evaluacion";


// Obtener fases por nivel
export async function obtenerFasesPorNivel(): Promise<Fase[]> {
  // --- INICIO DE MODIFICACIÓN ---
  // Antes: /fases/nivel/${nivelId}
  // Ahora: /evaluador/fases
  // Razón: El backend es más inteligente; detecta el nivel del
  // evaluador autenticado. No es necesario enviar el ID.
  const response = await api.get(`/evaluador/fases`);
  // --- FIN DE MODIFICACIÓN ---
  return response.data;
}

// Obtener lista de olimpistas de una fase
export async function obtenerOlimpistasPorFase(faseId: number): Promise<Olimpista[]> {
  const response = await api.get(`/evaluacion/fase/${faseId}`);
  return response.data;
}

// Guardar notas
export async function guardarNotas(faseId: number, olimpistas: Olimpista[]): Promise<void> {
  
  await api.post(`/evaluacion/fase/${faseId}/guardar`, { olimpistas });
}

// --- INICIO DE CÓDIGO AÑADIDO ---
// Estas son las funciones para los botones 

/**
 * Llama a la API para procesar las notas y asignar estados.
 * @param faseId El ID de la fase a procesar
 * @returns La lista actualizada de olimpistas con sus nuevos estados.
 */
export async function generarClasificados(faseId: number): Promise<Olimpista[]> {
  const response = await api.post(`/evaluacion/fase/${faseId}/generar-clasificados`);
  return response.data;
}

/**
 * Llama a la API para marcar la fase como "Enviada" o "Finalizada".
 * @param faseId El ID de la fase a enviar
 */
export async function enviarLista(faseId: number): Promise<{ message: string }> {
  const response = await api.post(`/evaluacion/fase/${faseId}/enviar-lista`);
  return response.data;
}
// --- FIN DE CÓDIGO AÑADIDO ---