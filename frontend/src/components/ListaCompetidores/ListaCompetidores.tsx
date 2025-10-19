// src/components/Lista Competidores/ListaCompetidores.tsx

import React, { useState, useEffect } from "react";
import AreaCompetencia from "./AreaCompetencia";
import type { ListaCompetidoresData } from "./tipo";

const Listas: React.FC = () => {
  const [data, setData] = useState<ListaCompetidoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListaCompetidores();
  }, []);

const fetchListaCompetidores = async () => {
  try {
    setLoading(true);
    //la URL por la de tu backend real
    const response = await fetch("http://localhost:8000/api/area-nivel");
    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    const result = await response.json();
    setData(result);
    setError(null);
  } catch {
    setError("Error al cargar las listas de competidores");
  } finally {
    setLoading(false);
  }
};



const handleAsignarEvaluador = (area: string, nivel: string) => {
  console.log('Asignar evaluador:', area, nivel);
};
const handleVerDetalles = (area: string, nivel: string) => {
  console.log('Ver detalles:', area, nivel);
};
const handleIniciarEvaluacion = (area: string, nivel: string) => {
  console.log('Iniciar evaluación:', area, nivel);
};
const handleContinuarEvaluacion = (area: string, nivel: string) => {
  console.log('Continuar evaluación:', area, nivel);
};


  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!data || data.areas.length === 0) return <div>No existen competidores registrados.</div>;

  return (
    <div>
      <h1>Listas de Competencia</h1>
      <span>Total: {data.total_competidores} competidores</span>
      <div>
        {data.areas.map((area) => (
          <AreaCompetencia
            key={area.area}
            area={area}
            onAsignarEvaluador={handleAsignarEvaluador}
            onVerDetalles={handleVerDetalles}
            onIniciarEvaluacion={handleIniciarEvaluacion}
            onContinuarEvaluacion={handleContinuarEvaluacion}
          />
        ))}
      </div>
    </div>
  );
};

export default Listas;