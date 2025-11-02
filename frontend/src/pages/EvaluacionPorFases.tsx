// src/pages/EvaluacionPorFases.tsx
import React, { useEffect, useState } from "react";
import type { Fase, Evaluable, InfoEvaluador, EvaluacionData } from "../interfaces/Evaluacion";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import {
  obtenerDatosDeEvaluacion,
  obtenerOlimpistasPorFase,
  guardarNotas,
  generarClasificados,
  enviarLista,
} from "../services/evaluacionService";
import { User, CalendarDays, Users } from 'lucide-react'; // <-- Usa Lucide
import "./evaluacion.css";

const EvaluacionPorFases: React.FC = () => {
  // --- Estados para los datos ---
  const [fases, setFases] = useState<Fase[]>([]);
  const [infoEvaluador, setInfoEvaluador] = useState<InfoEvaluador | null>(null);
  const [faseSeleccionada, setFaseSeleccionada] = useState<Fase | null>(null);
  const [evaluables, setEvaluables] = useState<Evaluable[]>([]); // <-- CORREGIDO
  const [fechaActual, setFechaActual] = useState<string>('');
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [loadingOlimpistas, setLoadingOlimpistas] = useState(false); // Renombrar a loadingEvaluables si se quiere
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const hoy = new Date();
    setFechaActual(hoy.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));

    (async () => {
      try {
        setLoading(true);
        const data: EvaluacionData = await obtenerDatosDeEvaluacion();
        
        setInfoEvaluador(data.infoEvaluador);
        setFases(data.fases);
        
        if (data.fases.length > 0) {
          setFaseSeleccionada(data.fases[0]);
        } else {
          setError("No hay fases asignadas para este nivel.");
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las fases. ¿Eres un evaluador con un nivel asignado?");
      }
      setLoading(false);
    })();
  }, []);

  // Efecto para cargar "evaluables" (olimpistas o equipos)
  useEffect(() => {
    if (faseSeleccionada) {
      cargarEvaluables(faseSeleccionada.id); // <-- CORREGIDO
    }
  }, [faseSeleccionada]);

  const cargarEvaluables = async (faseId: number) => { // <-- CORREGIDO
    setLoadingOlimpistas(true);
    clearMessages();
    try {
      const data = await obtenerOlimpistasPorFase(faseId);
      setEvaluables(data); // <-- CORREGIDO
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los participantes."); // <-- CORREGIDO
    }
    setLoadingOlimpistas(false);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // --- Manejadores de Botones ---

  const handleGuardar = async () => {
    if (!faseSeleccionada) return;
    clearMessages();
    setLoadingOlimpistas(true);
    try {
      await guardarNotas(faseSeleccionada.id, evaluables); // <-- CORREGIDO
      setSuccess("Notas guardadas correctamente ✅");
    } catch (err) {
      console.error("Error al guardar:", err); // Log más detallado
      setError("Error al guardar las notas.");
    }
    setLoadingOlimpistas(false);
  };

  const handleGenerarClasificados = async () => {
    if (!faseSeleccionada) return;
    if (!window.confirm("¿Estás seguro de generar los clasificados?")) return;
    
    clearMessages();
    setLoadingOlimpistas(true);
    try {
      const evaluablesActualizados = await generarClasificados(faseSeleccionada.id);
      setEvaluables(evaluablesActualizados); // <-- CORREGIDO
      setSuccess("Clasificados generados. Revisa la columna 'ESTADO'.");
    } catch (err) {
      console.error(err);
      setError("Error al generar clasificados.");
    }
    setLoadingOlimpistas(false);
  };

  const handleEnviarLista = async () => {
    if (!faseSeleccionada) return;
    if (!window.confirm("¿Estás seguro de enviar la lista? Esta acción es final.")) return;

    clearMessages();
    setLoadingOlimpistas(true);
    try {
      const res = await enviarLista(faseSeleccionada.id);
      setSuccess(res.message);
      
      // --- INICIO DE CORRECCIÓN ---
      // 1. Recargar la lista de fases para obtener los nuevos estados
      const data = await obtenerDatosDeEvaluacion();
      setFases(data.fases);

      // 2. Actualizar la fase seleccionada localmente
      // (Buscamos la versión actualizada de la fase en la nueva lista)
      const faseActualizada = data.fases.find(f => f.id === faseSeleccionada.id);
      if (faseActualizada) {
        setFaseSeleccionada(faseActualizada);
      }
    } catch (err) {
      console.error(err);
      setError("Error al enviar la lista.");
    }
    setLoadingOlimpistas(false);
  };

  // Lógica de UI para deshabilitar
  const isEditable = faseSeleccionada?.estado === 'En Proceso';

  if (loading) {
    return <div className="evaluacion-container"><p>Cargando panel de evaluador...</p></div>;
  }

  return (
    <div className="evaluacion-container">
      <h1 className="titulo">Evaluación de olimpistas</h1>
      
      {infoEvaluador && (
        <div className="evaluador-info-header">
          <div className="info-item">
            <User className="info-icon" />
            <span>{infoEvaluador.nombre}</span>
          </div>
          <div className="info-item">
            <strong>Área:</strong>
            <span>{infoEvaluador.area}</span>
          </div>
          <div className="info-item">
            <strong>Nivel:</strong>
            <span>{infoEvaluador.nivel}</span>
          </div>
          <div className="info-item info-fecha">
            <CalendarDays className="info-icon" />
            <span>{fechaActual}</span>
          </div>
        </div>
      )}

      {error && <div className="alerta alerta-error">{error}</div>}
      {success && <div className="alerta alerta-exito">{success}</div>}

      <div className="fases-tabs">
        {fases.map((f) => (
          <button
            key={f.id}
            onClick={() => setFaseSeleccionada(f)}
            className={`fase-tab ${
              faseSeleccionada?.id === f.id ? "active" : ""
            }`}
            disabled={loadingOlimpistas}
          >
            {f.nombre} ({f.estado})
          </button>
        ))}
      </div>

      {loadingOlimpistas ? (
        <p>Cargando participantes...</p>
      ) : (
        <>
          <div className="tabla-header-controles">
            <div className="info-olimpistas-conteo">
              <Users className="info-icon" />
              <span>{evaluables.length} participantes en esta fase</span>
            </div>
            <div className="botones-evaluacion">
              <button 
                onClick={handleGenerarClasificados}
                className="btn btn-purple"
                disabled={loadingOlimpistas || !isEditable}
              >
                Generar clasificados
              </button>
              <button 
                onClick={handleEnviarLista}
                className="btn btn-blue"
                disabled={loadingOlimpistas || !isEditable}
              >
                Enviar lista
              </button>
              <button 
                onClick={handleGuardar} 
                className="btn btn-green"
                disabled={loadingOlimpistas || !isEditable}
              >
                {loadingOlimpistas ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>
          </div>
          
          <EvaluacionTable 
            evaluables={evaluables} // <-- CORREGIDO
            onChange={setEvaluables} // <-- CORREGIDO
            isEditable={isEditable}
          />
        </>
      )}
    </div>
  );
};

export default EvaluacionPorFases;