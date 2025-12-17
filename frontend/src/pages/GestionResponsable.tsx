// src/pages/GestionResponsables.tsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../services/api";
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

  // Modal creación y edición
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [responsableToEdit, setResponsableToEdit] = useState<Usuario | null>(null);

  // Backend errors para modal
  const [modalErrors, setModalErrors] = useState<Record<string,string[]>>({});
  const [modalSaving, setModalSaving] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);

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
    setNotification({ isVisible: true, message, type, title, onConfirm });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  // 3. CARGA DE DATOS
  const fetchResponsables = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setPaginaActual(1);

      const response = await api.get("/responsable");
      const responsablesMapeados: Usuario[] = response.data.data.map((resp: Usuario) => ({
        id_usuario: resp.id_usuario,
        nombre: resp.nombre || "",
        apellidos: resp.apellidos || "",
        ci: resp.ci || "",
        email: resp.email || "",
        telefono: resp.telefono || null,
        area: resp.area || "",
        id_rol: resp.id_rol,
      }));

      setResponsables(responsablesMapeados);
    } catch (e: unknown) {
      console.error("Error fetching responsables:", e);
      let errorMessage = "No se pudo conectar con el servidor o no tienes permisos.";
      if (axios.isAxiosError(e)) errorMessage = e.response?.data?.message || e.message || errorMessage;
      else if (e instanceof Error) errorMessage = e.message;
      setError(errorMessage);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResponsables(); }, [fetchResponsables]);
  useEffect(() => { setPaginaActual(1); }, [filtro]);

  // =================== FUNCIONES DE MODAL ===================

  // Abrir modal de edición
  const openEditModal = (usuario: Usuario) => {
    setResponsableToEdit(usuario);
    setModalErrors({});
    setEditModalOpen(true);
  };

  // Cerrar modal de edición o creación
  const closeEditModal = () => {
    setResponsableToEdit(null);
    setModalErrors({});
    setModalSaving(false);
    setEditModalOpen(false);
    setIsCreateModalOpen(false);
  };

  // =================== CREAR RESPONSABLE ===================
  const handleCreateResponsable = async (newResponsable: Usuario) => {
    try {
      setModalSaving(true);
      setModalErrors({});
      const response = await api.post("/responsable", newResponsable);
      if (response.data?.data) {
        setResponsables(prev => [...prev, response.data.data]);
        closeEditModal();
        showNotification("Responsable creado exitosamente", 'success');
      }
    } catch (error: unknown) {
      console.error("Error al crear responsable:", error);
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        setModalErrors(error.response.data.errors);
      } else {
        showNotification("Error al crear responsable", 'error');
      }
    } finally {
      setModalSaving(false);
    }
  };

  // =================== EDITAR RESPONSABLE ===================
  const handleEditResponsable = async (editedResponsable: Usuario) => {
    const prevResponsables = [...responsables];
    try {
      setModalSaving(true);
      setModalErrors({});
      // Optimismo
      setResponsables(prev => prev.map(r => r.id_usuario === editedResponsable.id_usuario ? editedResponsable : r));
      await api.put(`/responsable/${editedResponsable.id_usuario}`, editedResponsable);
      closeEditModal();
      showNotification("Responsable actualizado exitosamente", 'success');
    } catch (err: unknown) {
      console.error("Error al actualizar responsable:", err);
      setResponsables(prevResponsables);
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        setModalErrors(err.response.data.errors);
      } else {
        showNotification("Error al actualizar responsable", 'error');
      }
    } finally {
      setModalSaving(false);
    }
  };

  // =================== ELIMINAR RESPONSABLE ===================
  const executeDeleteResponsable = useCallback(async (id: number) => {
    closeNotification();
    const prevResponsables = [...responsables];
    try {
      setResponsables(prev => prev.filter(r => r.id_usuario !== id));
      await api.delete(`/responsable/${id}`);
      showNotification("Responsable eliminado exitosamente", 'success');
    } catch (err: unknown) {
      console.error("Error al eliminar responsable:", err);
      setResponsables(prevResponsables);
      showNotification("Error al eliminar responsable", 'error');
    }
  }, [responsables, showNotification, closeNotification]);

  const handleDeleteResponsable = useCallback((id: number) => {
    const responsable = responsables.find(r => r.id_usuario === id);
    const nombreCompleto = responsable ? `${responsable.nombre} ${responsable.apellidos}` : `con ID: ${id}`;
    showNotification(
      `¿Estás seguro de que quieres eliminar a ${nombreCompleto}? Esta acción es irreversible.`,
      'confirm',
      () => executeDeleteResponsable(id),
      'Confirmar Eliminación'
    );
  }, [responsables, showNotification, executeDeleteResponsable]);

  // =================== FILTRO Y PAGINACIÓN ===================
  const responsablesFiltrados = responsables.filter(
    r =>
      r.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      r.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      r.ci.includes(filtro) ||
      r.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (r.telefono && r.telefono.includes(filtro)) ||
      r.area.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPaginas = Math.ceil(responsablesFiltrados.length / RESPONSABLES_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * RESPONSABLES_POR_PAGINA;
  const indiceFin = indiceInicio + RESPONSABLES_POR_PAGINA;
  const responsablesPaginados = responsablesFiltrados.slice(indiceInicio, indiceFin);
  const irAPagina = (pagina: number) => pagina >= 1 && pagina <= totalPaginas && setPaginaActual(pagina);
  const irAnterior = () => irAPagina(paginaActual - 1);
  const irSiguiente = () => irAPagina(paginaActual + 1);
  const rangoInicio = responsablesPaginados.length > 0 ? indiceInicio + 1 : 0;
  const rangoFin = indiceInicio + responsablesPaginados.length;

  // =================== RENDERIZADO ===================
  if (loading) return <div className="gestion-competidores-page"><div className="management-container">Cargando...</div></div>;
  if (error) return (
    <div className="gestion-competidores-page">
      <div className="management-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}<br/>
          <button onClick={fetchResponsables} className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Reintentar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="gestion-competidores-page">
      <div className="management-container">
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar responsable..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setIsCreateModalOpen(true)} className="primary-button">Nuevo Responsable</button>
        </div>

        <ResponsableTable
          usuario={responsablesPaginados}
          onEdit={openEditModal}
          onDelete={handleDeleteResponsable}
        />

        {responsablesFiltrados.length > 0 && (
          <div className="pagination-section">
            <span>Mostrando {rangoInicio} - {rangoFin} de {responsablesFiltrados.length} responsables</span>
            <div>
              <button onClick={irAnterior} disabled={paginaActual === 1}>Anterior</button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => irAPagina(page)} className={page === paginaActual ? 'active' : ''}>{page}</button>
              ))}
              <button onClick={irSiguiente} disabled={paginaActual === totalPaginas || totalPaginas === 0}>Siguiente</button>
            </div>
          </div>
        )}

        {/* Modal CREAR */}
        <EditResponsableModal
          usuario={null}
          onSave={handleCreateResponsable}
          onCancel={closeEditModal}
          isOpen={isCreateModalOpen}
          backendError={modalErrors}
          isSaving={modalSaving}
        />

        {/* Modal EDITAR */}
        <EditResponsableModal
          usuario={responsableToEdit}
          onSave={handleEditResponsable}
          onCancel={closeEditModal}
          isOpen={editModalOpen}
          backendError={modalErrors}
          isSaving={modalSaving}
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
    </div>
  );
};

export default GestionResponsables;
