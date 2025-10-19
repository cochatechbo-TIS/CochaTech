// src/components/ListaCompetidores/ListaCompetidores.tsx
import React, { useState, useEffect, useCallback } from "react";
import AreaCompetencia from "./AreaCompetencia";
import type { ListaCompetidoresData } from "./tipo";
import api from "../../services/api"; // <-- 1. Importar el servicio API
import axios from "axios"; // <-- 2. Importar axios para manejo de errores

const Listas: React.FC = () => {
  const [data, setData] = useState<ListaCompetidoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Usar useCallback para la función de carga
  const fetchListaCompetidores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 4. Usar api.post a la ruta correcta
      const response = await api.post("/area-nivel"); 

      // 5. Asumir que la respuesta de POST es la lista (según el nombre 'generarYListar')
      setData(response.data);

    } catch (e: unknown) {
      console.error("Error al cargar las listas de competidores:", e);
      let errorMessage = "Error al cargar las listas de competidores";
      
      // 6. Manejo de errores de Axios
      if (axios.isAxiosError(e)) {
        errorMessage = e.response?.data?.message || e.message;
        if (e.response?.status === 401) {
          errorMessage = "No autorizado. Inicia sesión de nuevo.";
        }
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // El array de dependencias está vacío

  useEffect(() => {
    fetchListaCompetidores();
  }, [fetchListaCompetidores]);


  // (El resto de tus funciones 'handle' están bien)
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

  if (loading) return <div className="p-8 text-center">Cargando listas...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data || !data.areas || data.areas.length === 0) {
    return <div className="p-8 text-center">No existen competidores registrados para listar.</div>;
  }

  return (
    // 7. Aplicar estilos consistentes
    <div className="gestion-page-container p-4">
      <div className="page-header">
        <h1 className="page-title">Listas de Competencia</h1>
        <p className="page-subtitle">
          Total: {data.total_competidores} competidores
        </p>
      </div>

      <div className="flex flex-col gap-4">
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
