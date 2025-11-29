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
  getNivelesEvaluador,
} from "../services/evaluacionService";
import { User, CalendarDays, Users } from 'lucide-react';
import "./evaluacion.css";

const EvaluacionPorFases: React.FC = () => {

  const [infoEvaluador, setInfoEvaluador] = useState<InfoEvaluador | null>(null);
  const [idNivelSeleccionado, setIdNivelSeleccionado] = useState<number | null>(null);
  const [nivelesEvaluador, setNivelesEvaluador] = useState<
    { id_nivel: number; nombre: string; es_grupal: boolean }[]
  >([]);

  const [fases, setFases] = useState<FasePestana[]>([]);
  const [faseSeleccionada, setFaseSeleccionada] = useState<FasePestana | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [esGrupal, setEsGrupal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [comentarioRechazo, setComentarioRechazo] = useState<string | null>(null);
  const [esFaseFinal, setEsFaseFinal] = useState(false);

  const fechaActual = new Date().toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Cargar los niveles del evaluador
  useEffect(() => {
    const cargarNiveles = async () => {
      try {
        const data = await getNivelesEvaluador();
        setNivelesEvaluador(data.niveles || []);
      } catch {
        setError("No se pudieron cargar los niveles del evaluador.");
      }
    };
    cargarNiveles();
  }, []);

  // Cargar datos iniciales (nivel por defecto)
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (faseSeleccionada) {
      cargarParticipantes(faseSeleccionada.id_nivel_fase);
    }
  }, [faseSeleccionada]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // CORRECCIÓN: Ahora siempre se actualiza correctamente idNivelSeleccionado
  const cargarDatosIniciales = async (idNivel?: number) => {
    try {
      setLoading(true);
      clearMessages();

      const data: EvaluadorInicioData = await getDatosInicialesEvaluador(idNivel);

      if (!data.infoEvaluador) throw new Error("No se recibió información del evaluador.");

      // SIEMPRE actualizar el nivel seleccionado
      setIdNivelSeleccionado(idNivel ?? data.infoEvaluador.id_nivel);

      setInfoEvaluador(data.infoEvaluador);
      setEsGrupal(data.infoEvaluador.es_grupal ?? false);
      setFases(data.fases || []);

      if (data.fases?.length > 0) {
        setFaseSeleccionada(data.fases[0]);
      } else {
        setFaseSeleccionada(null);
        setParticipantes([]);
        setError("No hay fases asignadas para este nivel.");
      }

    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }

    console.log("Nivel enviado →", idNivel);
  };

  const cargarParticipantes = async (idNivelFase: number) => {
    try {
      setLoadingParticipantes(true);
      clearMessages();

      const data = await getParticipantesPorFase(idNivelFase);
      setParticipantes(data.resultados || data.equipos || []);
      setEsFaseFinal(data.es_Fase_final ?? false);

      if (faseSeleccionada?.estado === "Rechazada") {
        const res = await api.get(`/nivel-fase/${idNivelFase}`);
        if (res.data?.comentario) setComentarioRechazo(res.data.comentario);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudieron cargar los participantes.");
    } finally {
      setLoadingParticipantes(false);
    }
  };

  // ⚡ Ahora sí cambia de nivel correctamente y carga el nuevo nivel
  const handleNivelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoId = Number(e.target.value);
    setIdNivelSeleccionado(nuevoId);
    cargarDatosIniciales(nuevoId);
  };

  const handleGuardarYClasificar = async () => {
    if (!faseSeleccionada) return;

    const payload: EvaluacionPayload[] = participantes.map(p => ({
      id_evaluacion: p.id_evaluacion,
      nota: p.nota ?? 0,
      comentario: p.observaciones ?? '',
      falta_etica: p.falta_etica ?? false,
    }));

    if (!window.confirm("¿Estás seguro de guardar y clasificar?")) return;

    try {
      setLoadingParticipantes(true);
      clearMessages();

      const res = await guardarYClasificar(faseSeleccionada.id_nivel_fase, payload);
      setSuccess(res.message);

      await cargarParticipantes(faseSeleccionada.id_nivel_fase);

    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar y clasificar.");
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const isEditable = faseSeleccionada?.estado === "En Proceso";

  if (loading) return <div className="evaluacion-container"><p>Cargando panel de evaluador...</p></div>;

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
            <strong>Área:</strong> <span>{infoEvaluador.nombre_area}</span>
          </div>

          <div className="info-item">
            <strong>Nivel:</strong>

            <select
              className="nivel-selector"
              value={idNivelSeleccionado ?? infoEvaluador.id_nivel}
              onChange={handleNivelChange}
              disabled={loadingParticipantes}
            >
              {nivelesEvaluador.map(n => (
                <option key={n.id_nivel} value={n.id_nivel}>
                  {n.nombre}
                </option>
              ))}
            </select>
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
        {fases.map(f => (
          <button
            key={f.id_nivel_fase}
            className={`fase-tab ${faseSeleccionada?.id_nivel_fase === f.id_nivel_fase ? "active" : ""}`}
            onClick={() => setFaseSeleccionada(f)}
            disabled={loadingParticipantes}
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

            <button
              onClick={handleGuardarYClasificar}
              className="btn btn-green"
              disabled={!isEditable || loadingParticipantes}
            >
              Guardar y Clasificar
            </button>
          </div>

          {comentarioRechazo && (
            <div className="alerta alerta-error alerta-rechazo">
              <strong>Motivo del Rechazo:</strong> {comentarioRechazo}
            </div>
          )}

          <EvaluacionTable
            participantes={participantes}
            onChange={setParticipantes}
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
