// src/pages/EvaluacionPorFases.tsx
import React, { useEffect, useState } from "react";
import api from "../services/api"; 
import type { 
  FasePestana, 
  InfoEvaluador, 
  Participante,
  EvaluacionPayload,
} from "../interfaces/Evaluacion";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import {
  getDatosInicialesEvaluador,
  getParticipantesPorFase,
  guardarYClasificar,
  getNivelesEvaluador,
  generarPrimeraFase,
} from "../services/evaluacionService";
import { User, CalendarDays, Users } from 'lucide-react';
import "./evaluacion.css";
import { NotificationModal } from "../components/common/NotificationModal";

type NotificationType = 'success' | 'error' | 'info' | 'confirm';

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

  const [comentarioRechazo, setComentarioRechazo] = useState<string | null>(null);
  const [esFaseFinal, setEsFaseFinal] = useState(false);
  const [faseCreada, setFaseCreada] = useState(false);

  // 🆕 ESTADOS DEL MODAL
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<NotificationType>('info');
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalOnConfirm, setModalOnConfirm] = useState<((value?: string) => void) | undefined>(undefined);

  const fechaActual = new Date().toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const showNotification = (
    message: string, 
    type: NotificationType = 'info', 
    title?: string,
    onConfirm?: (value?: string) => void
  ) => {
    setModalMessage(message);
    setModalType(type);
    setModalTitle(title);
    setModalOnConfirm(() => onConfirm); // Usar un callback para funciones asíncronas
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalOnConfirm(undefined);
  };

  // Cargar los niveles del evaluador
  useEffect(() => {
    const cargarNiveles = async () => {
      try {
        const data = await getNivelesEvaluador();
        setNivelesEvaluador(data.niveles || []);
      } catch {
        showNotification("No se pudieron cargar los niveles del evaluador.", "error");
      }
    };
    cargarNiveles();
  }, []);

  // Cargar datos iniciales (nivel por defecto)
  useEffect(() => {
    if (nivelesEvaluador.length > 0) {
    cargarDatosIniciales();
  }
}, [nivelesEvaluador]);

  useEffect(() => {
    if (faseSeleccionada) {
      cargarParticipantes(faseSeleccionada.id_nivel_fase);
    }
  }, [faseSeleccionada]);

  // CORRECCIÓN: Ahora siempre se actualiza correctamente idNivelSeleccionado
  const cargarDatosIniciales = async (idNivel?: number) => {
    try {
      setLoading(true);
      
    // Esperar a que los niveles estén cargados
    if (nivelesEvaluador.length === 0) {
      console.log("Niveles aún no listos, esperando...");
      return;
    }

      const nivelUsar =
        idNivel ??
        idNivelSeleccionado ??
        nivelesEvaluador[0]?.id_nivel;

      if (!nivelUsar) {
        throw new Error("No se pudo determinar el nivel del evaluador.");
      }
      console.log("Cargando datos para nivel:", nivelUsar);
    // Obtener datos iniciales normales
    let data = await getDatosInicialesEvaluador(nivelUsar);

    // SI NO EXISTEN FASES → CREAR AUTOMÁTICAMENTE
    if (!data.fases || data.fases.length === 0) {
      console.warn("No hay fases. Generando PRIMERA FASE automáticamente...");

       // evitar doble creación
  if (faseCreada) {
    console.log("Fase ya creada previamente, evitando doble ejecución");
  } else {
    console.warn("No hay fases. Generando PRIMERA FASE automáticamente...");
    await generarPrimeraFase(nivelUsar);
    setFaseCreada(true);
    showNotification("Primera fase generada automáticamente.", "info");
  }

  // recargar datos
  data = await getDatosInicialesEvaluador(nivelUsar);
  }
    
     if (!data.infoEvaluador) {
      throw new Error("No se recibió información del evaluador.");
     }

      // SIEMPRE actualizar el nivel seleccionado
      setIdNivelSeleccionado(nivelUsar);

      setInfoEvaluador(data.infoEvaluador);
      setEsGrupal(data.infoEvaluador.es_grupal ?? false);

      setFases(data.fases);

        setFaseSeleccionada(data.fases[0] ?? null);
      
    } catch (err: any) {
      console.error("Error al cargar datos iniciales:", err);
      showNotification(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }

    console.log("Nivel enviado →", idNivel);
  };

  const cargarParticipantes = async (idNivelFase: number) => {
    try {
      setLoadingParticipantes(true);

      const data = await getParticipantesPorFase(idNivelFase);
      setParticipantes(data.resultados || data.equipos || []);
      setEsFaseFinal(data.es_Fase_final ?? false);

      if (faseSeleccionada?.estado === "Rechazada") {
        const res = await api.get(`/nivel-fase/${idNivelFase}`);
        if (res.data?.comentario) setComentarioRechazo(res.data.comentario);
      }

    } catch (err: any) {
      showNotification(err.response?.data?.message || "No se pudieron cargar los participantes.", "error");
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

  const confirmarGuardarYClasificar = () => {
    if (!faseSeleccionada) return;

    // Reemplazamos window.confirm por el modal de confirmación
    showNotification(
      "Se guardarán las notas y la lista será enviada al responsable de área para aprobación.\n¿Confirmar el envío?",
      'confirm',
      'Confirmar Envio y Clasificación',
      ejecutarGuardarYClasificar // Pasamos la función a ejecutar si confirman
    );
  }

  const ejecutarGuardarYClasificar = async () => {
    if (!faseSeleccionada) return;

    handleCloseModal();

    const payload: EvaluacionPayload[] = participantes.map(p => ({
      id_evaluacion: p.id_evaluacion,
      nota: p.nota ?? 0,
      comentario: p.observaciones ?? '',
      falta_etica: p.falta_etica ?? false,
    }));

    try {
      setLoadingParticipantes(true);

      const res = await guardarYClasificar(faseSeleccionada.id_nivel_fase, payload);
      showNotification("Lista guardada y enviada para aprobación.", "success");
      
      await cargarParticipantes(faseSeleccionada.id_nivel_fase);

    } catch (err: any) {
      showNotification(err.response?.data?.error || "Error al guardar y clasificar.", "error");
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
              onClick={confirmarGuardarYClasificar}
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
      {/* 🆕 RENDERIZADO DEL MODAL */}
      <NotificationModal
        isVisible={modalVisible}
        message={modalMessage}
        type={modalType}
        title={modalTitle}
        onClose={handleCloseModal}
        onConfirm={modalOnConfirm}
        // Aquí podrías añadir isConfirmDisabled si fuera necesario, por ejemplo, para el tipo 'input'
      />
    </div>
  );
};

export default EvaluacionPorFases;
