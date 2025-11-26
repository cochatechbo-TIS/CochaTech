// src/pages/EvaluacionPorFases.tsx
import React, { useEffect, useState } from "react";
import api from "../services/api"; 
import type { 
  FasePestana, 
  InfoEvaluador, 
  Participante,
  EvaluacionPayload,
  EvaluadorInicioData
} from "../interfaces/Evaluacion";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import {
  getDatosInicialesEvaluador,
  getParticipantesPorFase,
  guardarYClasificar,
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
  const [comentarioRechazo, setComentarioRechazo] = useState<string | null>(null);
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [esFaseFinal, setEsFaseFinal] = useState(false);

  // Efecto para cargar datos iniciales (Panel y Pestañas)
  useEffect(() => {
    const hoy = new Date();
    setFechaActual(hoy.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));

    // Carga inicial sin ID (el backend elige el por defecto)
    cargarDatosIniciales();
  }, []);

  // Efecto para cargar la tabla de participantes
  useEffect(() => {
    if (faseSeleccionada) {
      cargarParticipantes(faseSeleccionada.id_nivel_fase);
    }
  }, [faseSeleccionada]);

  // --- MODIFICACIÓN: Función de carga ahora acepta ID opcional ---
  const cargarDatosIniciales = async (idNivel?: number) => {
    try {
      setLoading(true);
      clearMessages(); // Limpiamos mensajes previos al cambiar de nivel
      
      const data: EvaluadorInicioData = await getDatosInicialesEvaluador(idNivel);

      // ============================================================
      // 🚧 INICIO CÓDIGO TEMPORAL PARA PROBAR (Bórralo luego) 🚧
      // Simulamos que el backend nos envió la lista de niveles
      if (!data.infoEvaluador.niveles_asignados) {
        data.infoEvaluador.niveles_asignados = [
          { id_nivel: 1, nombre: "Q-Nivel 1", area: "Química" },
          { id_nivel: 2, nombre: "Q-Nivel 2", area: "Química" },
          { id_nivel: 3, nombre: "Q-Grupal 1", area: "Química" }
        ];
        // Simulamos propiedades nuevas si faltan
        data.infoEvaluador.id_nivel_actual = idNivel || data.infoEvaluador.id_nivel; 
      }
      // 🚧 FIN CÓDIGO TEMPORAL 🚧
      // ============================================================
      
      setInfoEvaluador(data.infoEvaluador);
      setFases(data.fases);
      // Usamos la propiedad del nivel actual (si existe, sino fallback al anterior)
      setEsGrupal(data.infoEvaluador.es_grupal_actual ?? data.infoEvaluador.es_grupal);
      
      if (data.fases.length > 0) {
        // Seleccionar la última fase disponible (la activa)
        setFaseSeleccionada(data.fases[data.fases.length - 1]);
      } else {
        setFaseSeleccionada(null);
        setError("No hay fases asignadas para este nivel.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar los datos del evaluador.");
    }
    setLoading(false);
  };

  const cargarParticipantes = async (idNivelFase: number) => {
    setLoadingParticipantes(true);
    clearMessages();
    setComentarioRechazo(null); 
    try {
      const data = await getParticipantesPorFase(idNivelFase);
      setParticipantes(data.resultados || data.equipos || []);
      setEsFaseFinal(data.es_Fase_final);

      if (faseSeleccionada?.estado === 'Rechazada') {
        const faseDetalleResponse = await api.get(`/nivel-fase/${idNivelFase}`);
        const comentario = faseDetalleResponse.data?.comentario;
        if (comentario) setComentarioRechazo(comentario);
      }

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

  const handleTablaChange = (participantesActualizados: Participante[]) => {
    setParticipantes(participantesActualizados);
  };

  // --- MODIFICACIÓN: Nuevo manejador para el selector ---
  const handleNivelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoId = Number(e.target.value);
    if (nuevoId) {
      cargarDatosIniciales(nuevoId); // Recarga todo con el nuevo nivel
    }
  };

  const handleGuardarYClasificar = async () => {
    if (!faseSeleccionada) return;
    
    const payload: EvaluacionPayload[] = participantes.map(p => ({
      id_evaluacion: p.id_evaluacion,
      nota: p.nota ?? 0, 
      comentario: p.observaciones ?? '',
      falta_etica: p.falta_etica ?? false,
    }));

    if (!window.confirm("¿Estás seguro de guardar y clasificar? Esta acción calculará los estados.")) return;
    
    clearMessages();
    setLoadingParticipantes(true);
    try {
      const res = await guardarYClasificar(faseSeleccionada.id_nivel_fase, payload);
      setSuccess(res.message); 
      await cargarParticipantes(faseSeleccionada.id_nivel_fase);
    } catch (err: any) {
      console.error("Error al clasificar:", err);
      setError(err.response?.data?.error || "Error al guardar y clasificar.");
    }
    setLoadingParticipantes(false);
  };
  
  const isEditable = faseSeleccionada?.estado === 'En Proceso';

  if (loading) {
    return <div className="evaluacion-container"><p>Cargando panel de evaluador...</p></div>;
  }

  return (
    <div className="evaluacion-container">
      <h1 className="titulo">Evaluación de olimpistas</h1>
      
      {infoEvaluador && (
        <div className="evaluador-info-header">
          {/* 1. EVALUADOR */}
          <div className="info-item">
            <User className="info-icon" />
            <span>{infoEvaluador.nombre_evaluador}</span>
          </div>
          
          {/* 2. ÁREA (Movido antes del Nivel) */}
          <div className="info-item">
            <strong>Área:</strong>
            <span>{infoEvaluador.nombre_area_actual || infoEvaluador.nombre_area}</span>
          </div>

          {/* 3. NIVEL + SELECTOR (Movido después del Área) */}
          <div className="info-item">
            <strong>Nivel:</strong>
            {infoEvaluador.niveles_asignados && infoEvaluador.niveles_asignados.length > 0 ? (
              <select 
                className="nivel-selector" 
                value={infoEvaluador.id_nivel_actual ?? infoEvaluador.id_nivel}
                onChange={handleNivelChange}
                disabled={loadingParticipantes}
              >
                {infoEvaluador.niveles_asignados.map((nivel) => (
                  <option key={nivel.id_nivel} value={nivel.id_nivel}>
                    {nivel.nombre} ({nivel.area})
                  </option>
                ))}
              </select>
            ) : (
              <span>{infoEvaluador.nombre_nivel_actual || infoEvaluador.nombre_nivel}</span>
            )}
          </div>
          
          {/* 4. FECHA (Siempre al final a la derecha) */}
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
              
              {/* --- ÚNICO BOTÓN VERDE (El azul ha sido eliminado) --- */}
              <button 
                onClick={handleGuardarYClasificar} 
                className="btn btn-green" 
                disabled={loadingParticipantes || loading || !isEditable}
              >
                {loadingParticipantes ? 'Guardando...' : 'Guardar y Clasificar'}
              </button>

            </div>
          </div>
          
          {comentarioRechazo && (
            <div className="alerta alerta-error alerta-rechazo">
              <strong>Motivo del Rechazo:</strong> {comentarioRechazo}
            </div>
          )}

          <EvaluacionTable 
            participantes={participantes} 
            onChange={handleTablaChange} 
            isEditable={isEditable}
            esGrupal={esGrupal}
            esFaseFinal={esFaseFinal}
          />
        </>
      )}
    </div>
  );
};

export default EvaluacionPorFases;