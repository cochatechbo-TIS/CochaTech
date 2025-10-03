// src/interfaces/Responsable.ts
export interface Responsable {
  id_responsable?: number;
  nombre: string;
  documento: string;
  email: string;
  telefono?: string;
  area: string;
  cargo: string;
  created_at?: string;
  updated_at?: string;
}