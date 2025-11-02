// src/pages/EvaluacionPorFases.tsx
import React, { useEffect, useState } from "react";
import type { 
  FasePestana, 
  InfoEvaluador, 
  Participante,
  EvaluacionPayload
} from "../interfaces/Evaluacion";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import {
  getDatosInicialesEvaluador,
  getParticipantesPorFase,
  guardarYClasificar,
  // --- INICIO DE CORRECCIÓN ---
  enviarListaYCrearSiguienteFase // <-- Nombre correcto de la función
  // --- FIN DE CORRECCIÓN ---
} from "../services/evaluacionService";
import { User, CalendarDays, Users } from 'lucide-react';
import "./evaluacion.css";

const EvaluacionPorFases: React.FC = () => {
  // --- Estados para los datos ---
  const [infoEvaluador, setInfoEvaluador] = useState<InfoEvaluador | null>(null);
  const [fases, setFases] = useState<FasePestana[]>([]);
  const [faseSeleccionada, setFaseSeleccionada] = useState<FasePestana | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [esGrupal, setEsGrupal] = useState(false);
  const [fechaActual, setFechaActual] = useState<string>('');
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Efecto para cargar datos iniciales (Panel y Pestañas)
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
        const data = await getDatosInicialesEvaluador();
        
        setInfoEvaluador(data.infoEvaluador);
        setFases(data.fases);
        setEsGrupal(data.infoEvaluador.es_grupal);
        
        if (data.fases.length > 0) {
          // Seleccionar la última fase disponible (la activa)
          setFaseSeleccionada(data.fases[data.fases.length - 1]);
        } else {
          setError("No hay fases asignadas para este nivel.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "No se pudieron cargar los datos del evaluador.");
      }
      setLoading(false);
    })();
  }, []);

  // Efecto para cargar la tabla de participantes
  useEffect(() => {
    if (faseSeleccionada) {
      cargarParticipantes(faseSeleccionada.id_nivel_fase);
    }
  }, [faseSeleccionada]);

  // --- Funciones de Lógica ---
  const cargarParticipantes = async (idNivelFase: number) => {
    setLoadingParticipantes(true);
    clearMessages();
    try {
      const data = await getParticipantesPorFase(idNivelFase);
      setParticipantes(data.resultados || data.equipos || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar los participantes.");
    }
    setLoadingParticipantes(false);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Actualiza el estado local de la tabla
  const handleTablaChange = (participantesActualizados: Participante[]) => {
    setParticipantes(participantesActualizados);
  };

  // --- Manejadores de Botones ---

  const handleGuardarYClasificar = async () => {
    if (!faseSeleccionada) return;
    
    // 1. Mapear los datos de la tabla al formato que espera la API
    const payload: EvaluacionPayload[] = participantes.map(p => ({
      id_evaluacion: p.id_evaluacion,
      nota: p.nota ?? 0, // Enviar 0 si es nulo
      comentario: p.observaciones ?? '',
      falta_etica: p.falta_etica ?? false,
    }));

    // 2. Confirmar
    if (!window.confirm("¿Estás seguro de guardar y clasificar? Esta acción calculará los estados.")) return;
    
    clearMessages();
    setLoadingParticipantes(true);
    try {
      const res = await guardarYClasificar(faseSeleccionada.id_nivel_fase, payload);
      setSuccess(res.message); // Ej: "clasificasion hecha correctamente"
      // Volver a cargar los participantes para ver los nuevos estados
      await cargarParticipantes(faseSeleccionada.id_nivel_fase);
    } catch (err: any) {
      console.error("Error al clasificar:", err);
      setError(err.response?.data?.error || "Error al guardar y clasificar.");
    }
    setLoadingParticipantes(false);
  };

  const handleEnviarLista = async () => {
    if (!infoEvaluador || !faseSeleccionada) return;
    
    // Lógica del nuevo controlador:
    // El botón "Enviar" ahora se llama "Generar Siguiente Fase"
    if (!window.confirm("¿Estás seguro de finalizar esta fase y generar la siguiente? Esta acción es final.")) return;

    clearMessages();
    setLoading(true); // Bloqueo general
    try {
      const res = await enviarListaYCrearSiguienteFase(infoEvaluador.id_nivel);
      setSuccess(res.message); // Ej: "Fase 2 generada correctamente."

      // Recargar TODO para ver la nueva pestaña
      const data = await getDatosInicialesEvaluador();
      setInfoEvaluador(data.infoEvaluador);
      setFases(data.fases);
      if (data.fases.length > 0) {
        setFaseSeleccionada(data.fases[data.fases.length - 1]);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error al generar la siguiente fase.");
    }
    setLoading(false);
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
            <span>{infoEvaluador.nombre_evaluador}</span>
          </div>
          <div className="info-item">
            <strong>Área:</strong>
            <span>{infoEvaluador.nombre_area}</span>
          </div>
          <div className="info-item">
            <strong>Nivel:</strong>
            <span>{infoEvaluador.nombre_nivel}</span>
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
            key={f.id_nivel_fase}
            onClick={() => setFaseSeleccionada(f)}
            className={`fase-tab ${
              faseSeleccionada?.id_nivel_fase === f.id_nivel_fase ? "active" : ""
            }`}
            disabled={loadingParticipantes || loading}
          >
            {f.nombre_fase} ({f.estado})
          </button>
        ))}
      </div>

      {loadingParticipantes ? (
        <p>Cargando participantes...</p>
      ) : (
        <>
          <div className="tabla-header-controles">
            <div className="info-olimpistas-conteo">
              <Users className="info-icon" />
              <span>{participantes.length} participantes en esta fase</span>
            </div>
            <div className="botones-evaluacion">
              
              {/* --- BOTONES ADAPTADOS A LA NUEVA LÓGICA --- */}
              
              <button 
                onClick={handleGuardarYClasificar} // Nuevo nombre
                className="btn btn-green" // Botón principal
                disabled={loadingParticipantes || loading || !isEditable}
              >
                {loadingParticipantes ? 'Guardando...' : 'Guardar y Clasificar'}
              </button>

              <button 
                onClick={handleEnviarLista}
                className="btn btn-blue" // Botón secundario
                disabled={loadingParticipantes || loading || !isEditable}
              >
                Finalizar y Generar Siguiente Fase
              </button>

              {/* Botón "Generar Clasificados" (el morado) eliminado
                  porque el nuevo backend lo fusionó con "Guardar". */}
              
            </div>
          </div>
          
          <EvaluacionTable 
            participantes={participantes} // <-- Nueva prop
            onChange={handleTablaChange} // <-- Nueva prop
            isEditable={isEditable}
            esGrupal={esGrupal} // <-- Nueva prop
          />
        </>
      )}
    </div>
  );
};

export default EvaluacionPorFases;