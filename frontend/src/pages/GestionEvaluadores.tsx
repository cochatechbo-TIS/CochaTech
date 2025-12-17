// src/pages/GestionEvaluadores.tsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../services/api"; // Importamos la instancia centralizada de Axios
import { EvaluadorTable } from "../components/evaluadores/EvaluadorTable"; // Asegúrate de que este componente exista
import { EditEvaluadorModal } from "../components/evaluadores/EditEvaluadorModal"; // Asegúrate de que este componente exista
import { NotificationModal } from '../components/common/NotificationModal';
import type { Usuario } from "../interfaces/Usuario";

type NotificationType = 'success' | 'error' | 'info' | 'confirm';

const EVALUADORES_POR_PAGINA = 20;
const GestionEvaluadores: React.FC = () => {
  // 1. ESTADOS
  const [evaluadores, setEvaluadores] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1); // Página inicial: 1

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvaluador, setSelectedEvaluador] = useState<Usuario | null>(null);

  
  const [backendError, setBackendError] = useState<Record<string, string[]> | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const handleCancelCreateModal = () => {
    setBackendError(undefined);
    setSaving(false);          
    setIsCreateModalOpen(false);
  };
  
  const openEditModal = (evaluador: Usuario) => {
    setBackendError(undefined);
    setSaving(false);

    // Inicializamos el estado aquí antes de abrir modal
    setSelectedEvaluador({ ...evaluador });
    setIsEditModalOpen(true);
};

  
  
   // ESTADO DE NOTIFICACIONES
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as NotificationType,
    title: undefined as string | undefined,
    onConfirm: undefined as (() => void) | undefined,
  });

   // FUNCIONES DE NOTIFICACIÓN
  const showNotification = useCallback((
    message: string, 
    type: NotificationType, 
    onConfirm?: () => void,
    title?: string
  ) => {
    setNotification({
      isVisible: true,
      message,
      type,
      title,
      onConfirm,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ 
      ...prev, 
      isVisible: false 
    }));
  }, []);

  // 3. FUNCIÓN DE CARGA DE DATOS
  const fetchEvaluadores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      setPaginaActual(1); // Reiniciar a la primera página al recargar datos

      console.log("Cargando evaluadores...");
      // RUTA DE TU API PARA LISTAR EVALUADORES
      const response = await api.get("/evaluador"); 

      /// Mapeo de datos (incluyendo campos de evaluador y manejo de 'area' flexible)
      const evaluadoresMapeados: Usuario[] = response.data.data.map(
        (evaluador: Usuario) => ({
          id_usuario: evaluador.id_usuario,
          nombre: evaluador.nombre || "",
          apellidos: evaluador.apellidos || "",
          ci: evaluador.ci || "", 
          email: evaluador.email || "",
          telefono: evaluador.telefono || null,
          // Mapeo flexible del área como en tu ejemplo de Evaluadores
          area: evaluador.area || "",
          id_rol: evaluador.id_rol,
          // Campos específicos de Evaluador
          // disponible: evaluador.disponible ?? true,
          // id_nivel: evaluador.id_nivel || null,
        })
      );

      console.log("Evaluadores cargados:", evaluadoresMapeados.length);
      setEvaluadores(evaluadoresMapeados);
    } catch (e: unknown) {
      console.error("Error fetching evaluadores:", e);
      let errorMessage =
        "No se pudo conectar con el servidor o no tienes permisos.";

      if (axios.isAxiosError(e)) {
        errorMessage = e.response?.data?.message || e.message || errorMessage;
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. EJECUTAR LA CARGA AL MONTAR
  useEffect(() => {
    fetchEvaluadores();
  }, [fetchEvaluadores]);

  // **NUEVO: Resetear página a 1 cuando el filtro cambie**
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  // 5. MANEJADORES DE ACCIONES

  // Función de edición (usando optimistic updates)
  const handleEditEvaluador = async (editedEvaluador: Usuario) => {
    try {
      setSaving(true);          // 🔥 PRIMERO
      setBackendError(undefined);
  
      await api.put(`/evaluador/${editedEvaluador.id_usuario}`, {
        nombre: editedEvaluador.nombre,
        apellidos: editedEvaluador.apellidos,
        ci: editedEvaluador.ci,
        email: editedEvaluador.email,
        telefono: editedEvaluador.telefono,
        area: editedEvaluador.area,
      });
  
      showNotification("Evaluador actualizado exitosamente", "success");
      setIsEditModalOpen(false);
      setSelectedEvaluador(null);
  
      await fetchEvaluadores();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setBackendError(err.response.data.errors);
        return;
      }
      showNotification("Error al actualizar evaluador", "error");
    } finally {
      setSaving(false);
    }
  };
  
  
  
  

  // Función de eliminación (usando optimistic updates)
  const executeDeleteEvaluador = useCallback(async (id: number) => {
    closeNotification(); // Cierra el modal de confirmación

    const evaluadoresAnteriores = [...evaluadores];
    const evaluadorAEliminar = evaluadores.find(e => e.id_usuario === id);

    if (!evaluadorAEliminar) {
      showNotification('Error: No se encontró el evaluador para eliminar.', 'error');
      return;
    }

    try {
      // Optimistic update
      setEvaluadores(prev => prev.filter(r => r.id_usuario !== id));

      // RUTA DE ELIMINACIÓN PARA EVALUADOR
      await api.delete(`/evaluador/${id}`);
      showNotification("Evaluador eliminado exitosamente", 'success');

    } catch (err: unknown) {
      console.error("Error al eliminar evaluador:", err);
      setEvaluadores(evaluadoresAnteriores); // Revertir

      let errorMessage = "Error al eliminar evaluador. El cambio fue revertido.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [evaluadores, showNotification, closeNotification]);

  // Función que dispara la confirmación de eliminación
  const handleDeleteEvaluador = useCallback((id: number) => {
    const evaluador = evaluadores.find(e => e.id_usuario === id);
    const nombreCompleto = evaluador 
      ? `${evaluador.nombre} ${evaluador.apellidos}` 
      : `con ID: ${id}`;
    
    showNotification(
      `¿Estás seguro de que quieres eliminar a ${nombreCompleto}? Esta acción es irreversible.`,
      'confirm',
      () => executeDeleteEvaluador(id),
      'Confirmar Eliminación'
    );
  }, [evaluadores, showNotification, executeDeleteEvaluador]);

  // Función de creación
  const handleCreateEvaluador = async (newEvaluador: Usuario) => {
    try {
      setSaving(true);
      setBackendError(undefined);
  
      await api.post("/evaluador", {
        nombre: newEvaluador.nombre,
        apellidos: newEvaluador.apellidos,
        ci: newEvaluador.ci,
        email: newEvaluador.email,
        telefono: newEvaluador.telefono,
        area: newEvaluador.area,
      });
  
      // ✅ ÉXITO
      showNotification("Evaluador creado exitosamente", "success");
  
      // ✅ Cerrar modal y limpiar estado
      setIsCreateModalOpen(false);
      setSaving(false);
  
      // ✅ RECARGAR TABLA DESPUÉS DE CREAR
      await fetchEvaluadores();
  
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setBackendError(err.response.data.errors);
          setSaving(false); // 🔥 IMPORTANTE
          return;
        }
  
        showNotification(
          err.response?.data?.message || "Error del servidor",
          "error"
        );
      } else if (err instanceof Error) {
        showNotification(err.message, "error");
      }
  
      setSaving(false); // 🔥 SIEMPRE
    }
  };
  

  // 6. FILTRO DE BÚSQUEDA
  const evaluadoresFiltrados = evaluadores.filter(
    (evaluador) =>
      evaluador.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      evaluador.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      evaluador.ci.includes(filtro) || 
      evaluador.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (evaluador.telefono && evaluador.telefono.includes(filtro)) || // ✨ AÑADIDO: Incluir teléfono en el filtro
      evaluador.area.toLowerCase().includes(filtro.toLowerCase())
  );
  // **NUEVO: LÓGICA DE PAGINACIÓN**
  const totalPaginas = Math.ceil(evaluadoresFiltrados.length / EVALUADORES_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * EVALUADORES_POR_PAGINA;
  const indiceFin = indiceInicio + EVALUADORES_POR_PAGINA;

  // **Evaluadores que se muestran en la tabla (paginados)**
  const evaluadoresPaginados = evaluadoresFiltrados.slice(indiceInicio, indiceFin);

  // **Controladores de paginación**
  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const irAnterior = () => irAPagina(paginaActual - 1);
  const irSiguiente = () => irAPagina(paginaActual + 1);

  // Cálculo para mostrar el rango actual
  const rangoInicio = evaluadoresPaginados.length > 0 ? indiceInicio + 1 : 0;
  const rangoFin = indiceInicio + evaluadoresPaginados.length;

  // 7. RENDERIZADO (Usando el patrón de tu código)
  if (loading) {
    return (
      <div className="gestion-competidores-page">
        <div className="management-container">
          <div className="flex justify-center items-center p-8">
            <div className="text-lg">Cargando evaluadores...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-competidores-page">
        <div className="management-container">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
            <br />
            <button
              onClick={fetchEvaluadores}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-competidores-page">
      <div className="management-container">
        {/* 🔍 BUSCADOR */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar evaluador..."
                className="search-input"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <div className="search-icon">
                <svg
                  className="search-svg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="primary-button"
          >
            <svg
              className="button-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Nuevo Evaluador</span>
          </button>
        </div>

        {/* TABLA */}
        <EvaluadorTable
          usuario={evaluadoresPaginados}
          onEdit={openEditModal} 
          onDelete={handleDeleteEvaluador}
        />
      </div>

      {/* PIE DE PÁGINA */}
      {evaluadoresFiltrados.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {rangoInicio} - {rangoFin} de {evaluadoresFiltrados.length} evaluadores
          </span>
          <div className="pagination-controls">
            <button
              onClick={irAnterior}
              disabled={paginaActual === 1} // **Deshabilitar en la primera página**
              className="pagination-btn pagination-btn-prev"
            >
              Anterior
            </button>
            {/* **Generación de botones de página simplificada** */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => irAPagina(page)}
                className={`pagination-btn ${page === paginaActual ? 'pagination-btn-active' : ''}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={irSiguiente}
              disabled={paginaActual === totalPaginas || totalPaginas === 0} // **Deshabilitar en la última página**
              className="pagination-btn pagination-btn-next"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}


      {/* ➕ MODAL CREAR */}
        <EditEvaluadorModal
          usuario={null}
          onSave={handleCreateEvaluador}
          onCancel={handleCancelCreateModal}
          isOpen={isCreateModalOpen}
          backendError={backendError}
          isSaving={saving}
        />

      <EditEvaluadorModal
        usuario={selectedEvaluador}
        onSave={handleEditEvaluador}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedEvaluador(null);
          setBackendError(undefined);
        }}
        isOpen={isEditModalOpen}
        backendError={backendError}
        isSaving={saving}
      />


      <NotificationModal
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        onClose={closeNotification}
        onConfirm={notification.onConfirm}
      />
    </div>
  );
};

export default GestionEvaluadores;