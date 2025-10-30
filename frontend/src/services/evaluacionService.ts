// src/services/evaluacionService.ts
import api from "./api";
import type { Fase, Olimpista } from "../interfaces/Evaluacion";

// --- INICIO DE CÓDIGO AÑADIDO (Nuevas Interfaces) ---
// Estas interfaces coinciden con la nueva respuesta de tu API

export interface InfoEvaluador {
  nombre: string;
  nivel: string;
  area: string;
}

// Esta es la estructura completa que devuelve la API
export interface EvaluacionData {
  infoEvaluador: InfoEvaluador;
  fases: Fase[];
}
// --- FIN DE CÓDIGO AÑADIDO ---


// --- INICIO DE MODIFICACIÓN ---
// Renombramos la función para que sea más clara
export async function obtenerDatosDeEvaluacion(): Promise<EvaluacionData> {
  // La ruta sigue siendo la misma
  const response = await api.get<EvaluacionData>(`/evaluador/fases`);
  
  // Devolvemos el objeto completo (info + fases)
  return response.data;
}
// --- FIN DE MODIFICACIÓN ---


// Obtener lista de olimpistas de una fase
export async function obtenerOlimpistasPorFase(faseId: number): Promise<Olimpista[]> {
  const response = await api.get(`/evaluacion/fase/${faseId}`);
  return response.data;
}

// Guardar notas
export async function guardarNotas(faseId: number, olimpistas: Olimpista[]): Promise<void> {
  await api.post(`/evaluacion/fase/${faseId}/guardar`, { olimpistas });
}

/**
 * Llama a la API para procesar las notas y asignar estados.
 */
export async function generarClasificados(faseId: number): Promise<Olimpista[]> {
  const response = await api.post(`/evaluacion/fase/${faseId}/generar-clasificados`);
  return response.data; // Devuelve la lista actualizada
}

/**
 * Llama a la API para marcar la fase como "Enviada" o "Finalizada".
 */
export async function enviarLista(faseId: number): Promise<{ message: string }> {
  const response = await api.post(`/evaluacion/fase/${faseId}/enviar-lista`);
  return response.data;
}