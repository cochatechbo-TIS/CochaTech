// src/pages/EvaluacionPorFases.tsx
import React, { useEffect, useState } from "react";
import type { Fase, Olimpista } from "../interfaces/Evaluacion";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import {
  obtenerFasesPorNivel,
  obtenerOlimpistasPorFase,
  guardarNotas,
  // --- INICIO DE CÓDIGO AÑADIDO ---
  generarClasificados,
  enviarLista,
  // --- FIN DE CÓDIGO AÑADIDO ---
} from "../services/evaluacionService";
import "./evaluacion.css";

const EvaluacionPorFases: React.FC = () => {
  const [fases, setFases] = useState<Fase[]>([]);
  const [faseSeleccionada, setFaseSeleccionada] = useState<Fase | null>(null);
  const [olimpistas, setOlimpistas] = useState<Olimpista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- INICIO DE MODIFICACIÓN ---
  // Ya no necesitamos un nivelId fijo, el backend lo sabe.
  // const nivelId = 2; 
  // --- FIN DE MODIFICACIÓN ---

  useEffect(() => {
    (async () => {
      try {
        // --- INICIO DE MODIFICACIÓN ---
        // Ya no se pasa el nivelId
        const fasesData = await obtenerFasesPorNivel();
        // --- FIN DE MODIFICACIÓN ---
        setFases(fasesData);
        if (fasesData.length > 0) setFaseSeleccionada(fasesData[0]);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las fases. ¿Eres un evaluador con un nivel asignado?");
      }
    })();
  }, []);

  useEffect(() => {
    if (faseSeleccionada) {
      cargarOlimpistas(faseSeleccionada.id);
    }
  }, [faseSeleccionada]);

  const cargarOlimpistas = async (faseId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await obtenerOlimpistasPorFase(faseId);
      setOlimpistas(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los olimpistas.");
    }
    setLoading(false);
  };

  // Limpia los mensajes de éxito/error
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleGuardar = async () => {
    if (!faseSeleccionada) return;
    clearMessages();
    setLoading(true);
    try {
      await guardarNotas(faseSeleccionada.id, olimpistas);
      setSuccess("Notas guardadas correctamente ✅");
    } catch (err) {
      console.error(err);
      setError("Error al guardar las notas.");
    }
    setLoading(false);
  };

  // --- INICIO DE CÓDIGO AÑADIDO ---
  const handleGenerarClasificados = async () => {
    if (!faseSeleccionada) return;
    if (!window.confirm("¿Estás seguro de que deseas generar los clasificados? Esto calculará el estado (Aprobado/Reprobado) basado en las notas guardadas.")) {
      return;
    }
    
    clearMessages();
    setLoading(true);
    try {
      // La API devuelve la lista actualizada de olimpistas
      const olimpistasActualizados = await generarClasificados(faseSeleccionada.id);
      setOlimpistas(olimpistasActualizados); // Actualizamos la tabla
      setSuccess("Clasificados generados correctamente. Revisa la columna 'ESTADO'.");
    } catch (err) {
      console.error(err);
      setError("Error al generar clasificados. Asegúrate de haber guardado las notas primero.");
    }
    setLoading(false);
  };

  const handleEnviarLista = async () => {
    if (!faseSeleccionada) return;
     if (!window.confirm("¿Estás seguro de enviar la lista? Esta acción marca la fase como finalizada y no podrás editarla después.")) {
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const res = await enviarLista(faseSeleccionada.id);
      setSuccess(res.message);
      // Opcional: deshabilitar la edición
    } catch (err) {
      console.error(err);
      setError("Error al enviar la lista.");
    }
    setLoading(false);
  };
  // --- FIN DE CÓDIGO AÑADIDO ---


  return (
    <div className="evaluacion-container">
      <h1 className="titulo">Evaluación de olimpistas</h1>

      {/* --- INICIO DE CÓDIGO AÑADIDO (Mensajes de Alerta) --- */}
      {error && <div className="alerta alerta-error">{error}</div>}
      {success && <div className="alerta alerta-exito">{success}</div>}
      {/* --- FIN DE CÓDIGO AÑADIDO --- */}


      {/* Tabs dinámicos */}
      <div className="fases-tabs">
        {fases.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFaseSeleccionada(f); clearMessages(); }}
            className={`fase-tab ${
              faseSeleccionada?.id === f.id ? "active" : ""
            }`}
          >
            {f.nombre} ({f.estado}) {/* Mostramos el estado de la fase */}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <p className="info-olimpistas">
            👥 {olimpistas.length} olimpistas en esta fase
          </p>

          <EvaluacionTable olimpistas={olimpistas} onChange={setOlimpistas} />

          <div className="botones-evaluacion">
            {/* --- INICIO DE MODIFICACIÓN (Conectamos los botones) --- */}
            <button 
              onClick={handleGenerarClasificados}
              className="btn btn-purple"
              disabled={loading}
            >
              Generar clasificados
            </button>
            <button 
              onClick={handleEnviarLista}
              className="btn btn-blue"
              disabled={loading}
            >
              Enviar lista
            </button>
            <button 
              onClick={handleGuardar} 
              className="btn btn-green"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar notas'}
            </button>
            {/* --- FIN DE MODIFICACIÓN --- */}
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluacionPorFases;