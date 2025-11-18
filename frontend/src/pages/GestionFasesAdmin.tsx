// src/pages/GestionFasesAdmin.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import { NotificationModal } from "../components/common/NotificationModal";
import api from "../services/api";
import type { FaseConsultaData, FasePestana, InfoNivelAdmin, Participante } from "../interfaces/Evaluacion";
import { User, Users } from 'lucide-react';
import axios from 'axios';

// ✅ Tipado para el estado de la notificación
type NotificationType = 'success' | 'error' | 'info' | 'confirm' | 'input';

//✅ Tipado para location.state
interface LocationState {
  nivelId: number;
}

const GestionFasesAdmin: React.FC = () => {
  const location = useLocation();
  const { nivelId } = (location.state as LocationState) || {};
  
  const [fases, setFases] = useState<FasePestana[]>([]);
  const [faseSeleccionada, setFaseSeleccionada] = useState<FasePestana | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [infoNivel, setInfoNivel] = useState<InfoNivelAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentandoCrearPrimeraFase, setIntentandoCrearPrimeraFase] = useState(false);

  // ✅ Estado para el modal de notificación
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as NotificationType,
    title: undefined as string | undefined,
    onConfirm: undefined as ((value?: string) => void) | undefined,
  });
  // Cargar fases del nivel
  useEffect(() => {
    if (nivelId) {
      cargarInfoNivel();
      cargarFases();
    } else {
      setError("No se recibió el ID del nivel");
      setLoading(false);
    }
  }, [nivelId]);

  // ✅ Funciones para manejar notificaciones
  const showNotification = (
    message: string,
    type: NotificationType,
    onConfirm?: (value?: string) => void,
    title?: string
  ) => {
    setNotification({
      isVisible: true,
      message,
      type,
      title,
      onConfirm,
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };
  
  // ✅ NUEVA FUNCIÓN: Obtener el nombre del evaluador
  const cargarInfoNivel = async () => {
    try {
      // Primero obtenemos el área del nivel haciendo una petición a /fase/{idNivelFase}
      // pero como no tenemos idNivelFase aún, usamos un truco:
      // Obtenemos TODAS las áreas y buscamos el nivel
      
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const isAdmin = user?.rol?.nombre_rol === 'administrador';

      if (isAdmin) {
        // Para admin: obtener todas las áreas y buscar el nivel
        const areasResponse = await api.get('/areas/nombres');
        const areas: string[] = areasResponse.data;

        // Buscar en cada área hasta encontrar el nivel
        for (const area of areas) {
          try {
            const nivelesResponse = await api.get(`/niveles/area/${area}`);
            const niveles = nivelesResponse.data.data || [];
            
            const nivelEncontrado = niveles.find((n: { id: number; }) => n.id === nivelId);
            
            if (nivelEncontrado) {
              // ✅ Encontramos el nivel, guardamos su información
              setInfoNivel(prev => ({
                ...prev!,
                evaluador: nivelEncontrado.evaluador || "Sin asignar",
                nombre: nivelEncontrado.nombre,
                area: nivelEncontrado.area,
                esGrupal: prev?.esGrupal || false
              }));
              break; // Salir del bucle
                       }
          } catch (err) {
            console.error(`Error al buscar en área ${area}:`, err);
          }
        }
      } else {
        // Para responsable: usar /niveles/auth
        const response = await api.get('/niveles/auth');
        const niveles = response.data.data || [];
        const nivelEncontrado = niveles.find((n: { id: number; }) => n.id === nivelId);
        
        if (nivelEncontrado) {
          setInfoNivel(prev => ({
            ...prev!,
            evaluador: nivelEncontrado.evaluador || "Sin asignar",
            nombre: nivelEncontrado.nombre,
            area: nivelEncontrado.area,
            esGrupal: prev?.esGrupal || false

          }));
        }
      }
    } catch (error) {
      console.error("Error al cargar información del nivel:", error);
    }
  };

  const cargarFases = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Cargando fases para nivel:", nivelId);
      const response = await api.get(`/cantidad/fases/${nivelId}`);
      console.log("Respuesta del backend:", response.data);
      
      // Validar estructura
      if (!response.data || !response.data.fases) {
        throw new Error("El backend no devolvió el formato esperado");
      }

      const fasesData: FasePestana[] = response.data.fases.map((f: FasePestana) => ({
        id_nivel_fase: f.id_nivel_fase,
        nombre_fase: f.nombre_fase,
        orden: f.orden,
        estado: f.estado
      }));

      console.log("📋 Fases procesadas:", fasesData);

      setFases(fasesData);
      if (fasesData.length > 0) {
        setFaseSeleccionada(fasesData[fasesData.length - 1]); // Seleccionar última fase
      }
      } catch (error) {
      console.error("Error al cargar fases:", error);
      
      // 🔧 CORRECCIÓN: Manejar el caso cuando no hay fases (404)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log("No hay fases registradas, iniciando creación automática...");
        setFases([]);
        setFaseSeleccionada(null);
        
        // Solo intentar crear si no lo estamos haciendo ya
        if (!intentandoCrearPrimeraFase) {
          crearPrimeraFaseAutomaticamente();
        }
      } else {
        let errorMsg = "Error al cargar las fases";
        if (axios.isAxiosError(error)) {
          errorMsg = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 🔧 NUEVA FUNCIÓN: Separar la lógica de creación de primera fase
  const crearPrimeraFaseAutomaticamente = async () => {
    setIntentandoCrearPrimeraFase(true);
    
    try {
      console.log("Intentando crear primera fase para nivel:", nivelId);
      await api.get(`/primera/fase/${nivelId}`);
      showNotification("Se ha generado la primera fase para este nivel.", "success");
      
      // Esperar un momento antes de recargar
      setTimeout(() => {
        cargarFases();
        setIntentandoCrearPrimeraFase(false);
      }, 500);
      
    } catch (createError) {
      console.error("Error al crear primera fase:", createError);
      setIntentandoCrearPrimeraFase(false);
      
      let errorMsg = "No se pudo generar la primera fase automáticamente.";
      if (axios.isAxiosError(createError)) {
        errorMsg = createError.response?.data?.error || createError.response?.data?.message || errorMsg;
      }
      
      setError(`Este nivel aún no tiene fases. ${errorMsg}`);
      showNotification(errorMsg, "error");
    }
  };
  
  // Cargar participantes cuando cambia la fase
  useEffect(() => {
    if (faseSeleccionada) {
      cargarParticipantes(faseSeleccionada.id_nivel_fase);
    }
  }, [faseSeleccionada]);

  const cargarParticipantes = async (idNivelFase: number) => {
    try {
      setLoadingParticipantes(true);
      setError(null);

      console.log("Cargando participantes para fase:", idNivelFase);

      const response = await api.get(`/fase/${idNivelFase}`);
      console.log("Respuesta de participantes:", response.data);

      const data = response.data as FaseConsultaData;
      console.log("Respuesta de participantes:", data);
      
      // Adaptar según tipo (individual/grupal)
      if (data.tipo === 'grupal') {
        setParticipantes(data.equipos || []);
      } else {
        setParticipantes(data.resultados || []);
      }
      
      // Actualizar info del nivel con los datos de la fase
      setInfoNivel(prev => {
        const esGrupal = data.tipo === 'grupal';
        // Si 'prev' no existe, inicializamos el objeto.
        // Si 'prev' existe, lo usamos como base para no perder el evaluador.
        return {
          ...prev,
          nombre: data.nivel,
          area: data.area,
          esGrupal: esGrupal,
          evaluador: prev?.evaluador || "Cargando...",
          es_Fase_final: data.es_Fase_final
        };
      });
    } catch (error) {
      console.error("Error al cargar participantes:", error);
      let errorMsg = "Error al cargar participantes";
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || "Error al cargar participantes (API)";
      }
      setError(errorMsg);
    } finally {
      setLoadingParticipantes(false);
    }
  };
  
  const handleAprobar = async () => {
    if (!faseSeleccionada || !nivelId || !infoNivel) return;

    try {
      const esUltimaFaseActual = infoNivel.es_Fase_final;

      // Mensaje de confirmación dinámico
      const confirmMessage = infoNivel.es_Fase_final
        ? "¿Está seguro de aprobar esta fase final? Esta acción marcará la fase como completada."
        : "¿Está seguro de aprobar esta fase? Esta acción generará la siguiente fase con los participantes clasificados.";

      if (!window.confirm(confirmMessage)) return;

      if (esUltimaFaseActual) {
        // Lógica para la última fase: solo aprobar
        await api.post(`/nivel-fase/aprobar/${faseSeleccionada.id_nivel_fase}`);
        showNotification("Fase final aprobada correctamente.", "success");
      } else {
        // Lógica para fases no finales: generar siguiente fase
        const response = await api.post(`/fase-nivel/siguiente/${nivelId}`);
        showNotification(response.data.message || "Siguiente fase generada correctamente.", 'success');
      }

      cargarFases(); // Recargar para ver el nuevo estado y la nueva fase si se generó
    } catch (error) {
      console.error("Error al aprobar:", error);
      let errorMsg = "Error al procesar la aprobación.";
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.error || error.response?.data?.message || errorMsg;
      }
      showNotification(errorMsg, 'error');
    }
  };
  
  // Lógica de rechazo extraída para ser llamada por el modal
  const executeRechazar = async (comentario: string) => {
    if (!faseSeleccionada) return;
    closeNotification(); // Cierra el modal de input

    try {
      await api.post(`/nivel-fase/rechazar/${faseSeleccionada.id_nivel_fase}`, {
        comentario
      });
      showNotification("Fase rechazada correctamente. Se notificará al evaluador.", 'success');
      cargarFases();
    } catch (error) {
      console.error("Error al rechazar:", error);
      let errorMsg = "Error al rechazar la fase";
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
      showNotification(errorMsg, 'error');
    }
  };

  // Manejador del botón "Rechazar Fase" que ahora abre el modal
  const handleRechazar = () => {
    if (!faseSeleccionada) return;

    showNotification(
      `Está a punto de rechazar la "${faseSeleccionada.nombre_fase}". Por favor, detalle el motivo para que el evaluador pueda hacer las correcciones necesarias.`,
      'input',
      (comentario) => {
        if (comentario && comentario.trim()) {
          executeRechazar(comentario.trim());
        }
      },
      'Motivo del Rechazo'
    );
  };
  // Loading state
  if (loading || intentandoCrearPrimeraFase) {
    return (
      <div className="gestion-competidores-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{intentandoCrearPrimeraFase? 'Generando primera fase...' : 'Cargando información...'}</p>
        </div>
      </div>
    );
  }

  if (error && fases.length === 0) {
    return (
      <div className="evaluacion-container">
        <div className="alerta alerta-error">{error}</div>
      </div>
    );
  }
  return (
    <div className="gestion-competidores-page">
      <div className="page-content-wrapper">
      <h1 className="titulo">Gestión de Fases</h1>

    {infoNivel && (
      <div className="evaluador-info-header">
      <div className="info-item">
        <User className="info-icon" />
        <span>
          <strong>Evaluador:</strong> {infoNivel.evaluador || "Sin asignar"}
          </span>
      </div>
      <div className="info-item">
        <strong>Área:</strong>
        <span>{infoNivel.area}</span>
      </div>
      <div className="info-item">
        <strong>Nivel:</strong>
        <span>{infoNivel.nombre}</span>
      </div>
      <div className="info-item info-fecha">
        <span>
          {new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
    )}

      {/* Pestañas de fases */}
      <div className="fases-tabs">
        {fases.map((f) => (
          <button
            key={f.id_nivel_fase}
            onClick={() => setFaseSeleccionada(f)}
            className={`fase-tab ${
              faseSeleccionada?.id_nivel_fase === f.id_nivel_fase ? "active" : ""
            }`}
            disabled={loadingParticipantes}
          >
            {f.nombre_fase} ({f.estado})
          </button>
        ))}
      </div>
      <div className="tabla-header-controles">
        <div className="info-olimpistas-conteo">
          <Users className="info-icon" />
          <span>{participantes.length} participantes en esta fase</span>
        </div>
        {/* Botones de acción movidos aquí */}
        {faseSeleccionada && faseSeleccionada.estado !== 'Aprobada' && (
          <div className="botones-evaluacion">
            <button
              onClick={handleAprobar}
              className="btn btn-green"
              disabled={loadingParticipantes}
            >
              Aprobar Fase
            </button>
            <button onClick={handleRechazar} className="btn btn-red"
              disabled={loadingParticipantes}
            >
              Rechazar Fase
            </button>
          </div>
        )}
      </div>

      {/* Tabla de participantes */}
      {loadingParticipantes ? (
        <p>⏳ Cargando participantes...</p>
      ) : (
        <EvaluacionTable 
          participantes={participantes}
          onChange={() => {}}
          isEditable={false}
          esGrupal={infoNivel?.esGrupal || false}
        />
      )}

      {/* ✅ Renderizado del modal de notificación */}
      <NotificationModal
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        onClose={closeNotification}
        onConfirm={notification.onConfirm}
      />
    </div>
    </div>
  );
};

export default GestionFasesAdmin;