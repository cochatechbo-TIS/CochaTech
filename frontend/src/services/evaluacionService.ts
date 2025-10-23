// src/services/evaluacionService.ts
import api from "./api"; // usa tu instancia axios ya configurada en src/services/api.ts
import type { Fase, Olimpista } from "../interfaces/Evaluacion";


// Obtener fases por nivel
export async function obtenerFasesPorNivel(nivelId: number): Promise<Fase[]> {
  const response = await api.get(`/fases/nivel/${nivelId}`);
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