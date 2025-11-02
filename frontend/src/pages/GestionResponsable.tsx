// src/pages/GestionResponsables.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios"; // Necesitas importar axios
import { ResponsableTable } from "../components/responsables/ResponsableTable";
import { EditResponsableModal } from "../components/responsables/EditResponsableModal";
import { NotificationModal } from '../components/common/NotificationModal';
import type { Usuario } from "../interfaces/Usuario";

type NotificationType = 'success' | 'error' | 'info' | 'confirm';

const RESPONSABLES_POR_PAGINA = 20;
const GestionResponsables: React.FC = () => {
  // 1. ESTADOS
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  // ESTADO DE NOTIFICACIONES
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as NotificationType,
    title: undefined as string | undefined,
    onConfirm: undefined as (() => void) | undefined,
  });

  const API_BASE = "http://localhost:8000/api"; // URL base de la API

  // 2. CONFIGURACIÓN AXIOS CON AUTH (REUTILIZADA DE COMPETIDORES)
  const api = useMemo(() => {
    const token = localStorage.getItem("authToken");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return axios.create({
      baseURL: API_BASE,
      headers: headers,
    });
  }, []);

  
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
  const fetchResponsables = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setPaginaActual(1);

      console.log("Cargando responsables...");
      // RUTA DE TU API PARA LISTAR RESPONSABLES
      const response = await api.get("/responsable");

      /// Mapeo de datos (simplificado para coincidir con la nueva interfaz y tabla)
      const responsablesMapeados: Usuario[] = response.data.data.map(
        (resp: Usuario) => ({
          id_usuario: resp.id_usuario,
          nombre: resp.nombre || "", // Nombre de pila
          apellidos: resp.apellidos || "", // Apellidos
          ci: resp.ci || "", // Cédula de Identidad
          email: resp.email || "",
          telefono: resp.telefono || null,
          area: resp.area || "",
          id_rol: resp.id_rol,
        })
      );

      console.log("Responsables cargados:", responsablesMapeados.length);
      setResponsables(responsablesMapeados);
    } catch (e: unknown) {
      console.error("Error fetching responsables:", e);
      let errorMessage =
        "No se pudo conectar con el servidor o no tienes permisos.";

      if (axios.isAxiosError(e)) {
        // Verificamos si es un error de Axios
        // Accedemos a los datos de la respuesta del error
        errorMessage = e.response?.data?.message || e.message || errorMessage;
      } else if (e instanceof Error) {
        // Si es una instancia de Error JS estándar
        errorMessage = e.message;
      }
      // Si no es un error de Axios ni una instancia de Error, usamos el mensaje por defecto.

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // 4. EJECUTAR LA CARGA AL MONTAR
  useEffect(() => {
    fetchResponsables();
  }, [fetchResponsables]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  // 5. MANEJADORES DE ACCIONES (Actualizados para usar el estado)

  // Función de edición (usaremos el ID del responsable)

    const handleEditResponsable = async (editedResponsable: Usuario) => {
    console.log("Guardando edición de responsable:", editedResponsable);

    const responsablesAnteriores = [...responsables];

    try {
        //optimiasmo
        setResponsables(prev =>
        prev.map(r =>
            r.id_usuario === editedResponsable.id_usuario ? editedResponsable : r
        )
        );

        await api.put(`/responsable/${editedResponsable.id_usuario}`, editedResponsable);

        showNotification('Responsable actualizado exitosamente', 'success');
    } catch (err: unknown) {
        console.error("Error al actualizar responsable:", err);

        setResponsables(responsablesAnteriores);

        let errorMessage = 'Error al actualizar responsable. El cambio fue revertido.';

        if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
        } else if (err instanceof Error) {
        errorMessage = err.message;
        }

        showNotification(errorMessage, 'error');
        throw err;
    }
    };

  // Función de eliminación (usaremos el ID del responsable)
  const executeDeleteResponsable = useCallback(async (id: number) => {
    closeNotification(); 

    const responsablesAnteriores = [...responsables];

    const responsableAEliminar = responsables.find(r => r.id_usuario === id);

    if (!responsableAEliminar) {
      showNotification('Error: No se encontró el responsable para eliminar.', 'error');
      return;
    }
    try {
        setResponsables(prev => prev.filter(r => r.id_usuario !== id));
        await api.delete(`/responsable/${id}`);
        showNotification("Responsable eliminado exitosamente", 'success');

    } catch (err: unknown) {
        console.error("Error al eliminar responsable:", err);
        setResponsables(responsablesAnteriores);
        let errorMessage = "Error al eliminar responsable. El cambio fue revertido.";
        if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
        } else if (err instanceof Error) {
        errorMessage = err.message;
        }
        showNotification(errorMessage, 'error');
        throw err;
      }
    }, [api, responsables, showNotification, closeNotification]);

    // Función que dispara la confirmación de eliminación
  const handleDeleteResponsable = useCallback((id: number) => {
    const responsable = responsables.find(r => r.id_usuario === id);
    const nombreCompleto = responsable 
      ? `${responsable.nombre} ${responsable.apellidos}` 
      : `con ID: ${id}`;
    
    showNotification(
      `¿Estás seguro de que quieres eliminar a ${nombreCompleto}? Esta acción es irreversible.`,
      'confirm',
      () => executeDeleteResponsable(id),
      'Confirmar Eliminación'
    );
  }, [responsables, showNotification, executeDeleteResponsable]);

  // Función de creación
    const handleCreateResponsable = async (newResponsable: Usuario) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/responsable", {
        nombre: newResponsable.nombre,
        apellidos: newResponsable.apellidos,
        ci: newResponsable.ci,
        email: newResponsable.email,
        telefono: newResponsable.telefono,
        area: newResponsable.area,
      });
      if (response.data) {
          // Agregar el nuevo responsable con el ID que devuelve el servidor
        const responsableCreado = response.data.data || newResponsable;
        setResponsables((prev) => [...prev, responsableCreado]);
        
        showNotification("Responsable creado exitosamente", 'success');
        setIsCreateModalOpen(false);
      } else {
        showNotification("No se recibió confirmación del servidor.", 'error');
      }
    } catch (error: unknown) {
      console.error("Error al crear responsable:", error);

      let errorMessage = "Error al registrar el responsable.";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const responsablesFiltrados = responsables.filter(
    (resp) =>
      resp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.ci.includes(filtro) || // Usamos 'ci'
      resp.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (resp.telefono && resp.telefono.includes(filtro)) || // ✨ AÑADIDO: Incluir teléfono en el filtro
      resp.area.toLowerCase().includes(filtro.toLowerCase())
  );
  
  // **NUEVO: LÓGICA DE PAGINACIÓN**
  const totalPaginas = Math.ceil(responsablesFiltrados.length / RESPONSABLES_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * RESPONSABLES_POR_PAGINA;
  const indiceFin = indiceInicio + RESPONSABLES_POR_PAGINA;

  // **Responsables que se muestran en la tabla (paginados)**
  const responsablesPaginados = responsablesFiltrados.slice(indiceInicio, indiceFin);

  // **Controladores de paginación**
  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const irAnterior = () => irAPagina(paginaActual - 1);
  const irSiguiente = () => irAPagina(paginaActual + 1);  
  // Cálculo para mostrar el rango actual
  const rangoInicio = responsablesPaginados.length > 0 ? indiceInicio + 1 : 0;
  const rangoFin = indiceInicio + responsablesPaginados.length;

  // 6. RENDERIZADO CONDICIONAL DE CARGA/ERROR
  if (loading) {
    return (
      <div className="gestion-competidores-page">
        <div className="management-container">
          <div className="flex justify-center items-center p-8">
            <div className="text-lg">Cargando responsables...</div>
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
              onClick={fetchResponsables}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. RENDERIZADO PRINCIPAL
  return (
    <div className="gestion-competidores-page">
      <div className="management-container">
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar responsable..."
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
            <span>Nuevo Responsable</span>
          </button>
        </div>

        <ResponsableTable
          usuario={responsablesPaginados}
          onEdit={handleEditResponsable}
          onDelete={handleDeleteResponsable}
        />
      </div>

      {responsablesFiltrados.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {rangoInicio} - {rangoFin} de {responsablesFiltrados.length} responsables
          </span>
          <div className="pagination-controls">
            <button
              onClick={irAnterior}
              disabled={paginaActual === 1} 
              className="pagination-btn pagination-btn-prev"
            >
              Anterior
            </button>

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
              disabled={paginaActual === totalPaginas || totalPaginas === 0} 
              className="pagination-btn pagination-btn-next"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo responsable (o editar, si se usa para ambos) */}
      <EditResponsableModal
        usuario={null} // null para el modo creación
        onSave={handleCreateResponsable}
        onCancel={() => setIsCreateModalOpen(false)}
        isOpen={isCreateModalOpen}
      />

      {/* Modal de Notificaciones */}
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

export default GestionResponsables;
