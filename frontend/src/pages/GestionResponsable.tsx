// src/pages/GestionResponsables.tsx
import React, { useState, useEffect, useCallback } from "react";
// CORRECCIÓN: Importa el api centralizado
import api from "../services/api";
// Mantenido SOLO para 'isAxiosError'
import axios from "axios";
import { ResponsableTable } from "../components/responsables/ResponsableTable";
import { EditResponsableModal } from "../components/responsables/EditResponsableModal";
// CORRECCIÓN: Importa el tipo específico
import type { Responsable } from "../../types/User.types";

const GestionResponsables: React.FC = () => {
  // CORRECCIÓN: Usa el tipo 'Responsable'
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- ELIMINADO ---
  // Ya no necesitamos API_BASE ni el useMemo para crear 'api' localmente
  // --- FIN ELIMINADO ---

  const fetchResponsables = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Cargando responsables...");

      // Usamos el 'api' importado directamente
      const response = await api.get("/responsable");

      // CORRECCIÓN: Mapea a la interfaz 'Responsable'
      const responsablesMapeados: Responsable[] = response.data.data.map(
        (resp: any): Responsable => ({ // Usar 'any' temporalmente si la respuesta no coincide 100%
          id_usuario: resp.id_usuario,
          nombre: resp.nombre || "",
          apellidos: resp.apellidos || "",
          ci: resp.ci || "",
          email: resp.email || "",
          telefono: resp.telefono || null,
          area: resp.area || "", // El GET /responsable ya devuelve el nombre del área
          id_rol: resp.id_rol,
        })
      );

      console.log("Responsables cargados:", responsablesMapeados.length);
      setResponsables(responsablesMapeados);
    } catch (e: unknown) {
      console.error("Error fetching responsables:", e);
      let errorMessage = "No se pudo conectar con el servidor o no tienes permisos.";

      if (axios.isAxiosError(e)) {
        errorMessage = e.response?.data?.message || e.message || errorMessage;
        if (e.response?.status === 401) {
          errorMessage = "Error de autorización. Intenta iniciar sesión de nuevo.";
          // Opcional: Podrías llamar a logout() aquí
        }
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    // CORRECCIÓN: 'api' ya no es una dependencia
  }, []);

  useEffect(() => {
    fetchResponsables();
  }, [fetchResponsables]);

  // --- Manejadores de Acciones ---

  // CORRECCIÓN: Usa el tipo 'Responsable'
  const handleEditResponsable = async (editedResponsable: Responsable) => {
    console.log("Guardando edición de responsable:", editedResponsable);
    const responsablesAnteriores = [...responsables];

    try {
      // Optimistic update
      setResponsables(prev =>
        prev.map(r =>
          r.id_usuario === editedResponsable.id_usuario ? editedResponsable : r
        )
      );

      // Usa el 'api' importado
      // El backend espera el ID en la URL y los datos en el cuerpo
      await api.put(`/responsable/${editedResponsable.id_usuario}`, {
          // Enviar solo los campos editables
          nombre: editedResponsable.nombre,
          apellidos: editedResponsable.apellidos,
          ci: editedResponsable.ci,
          email: editedResponsable.email,
          telefono: editedResponsable.telefono,
          // Si el área es editable, asegúrate de enviar el NOMBRE o ID según espere el backend
          area: editedResponsable.area,
      });

      alert('Responsable actualizado correctamente.');
      // Opcional: fetchResponsables(); para recargar
    } catch (err: unknown) {
      console.error("Error al actualizar responsable:", err);
      setResponsables(responsablesAnteriores); // Revertir
      let errorMessage = 'Error al actualizar responsable. El cambio fue revertido.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || errorMessage; // Captura error de email único
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  const handleDeleteResponsable = async (id_usuario: number) => {
    const responsableAEliminar = responsables.find(r => r.id_usuario === id_usuario);
    if (!responsableAEliminar) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${responsableAEliminar.nombre} ${responsableAEliminar.apellidos}?`)) {
      return;
    }

    const responsablesAnteriores = [...responsables];
    try {
      // Optimistic update
      setResponsables(prev => prev.filter(r => r.id_usuario !== id_usuario));

      // Usa el 'api' importado
      await api.delete(`/responsable/${id_usuario}`);
      alert("Responsable eliminado exitosamente.");

    } catch (err: unknown) {
      console.error("Error al eliminar responsable:", err);
      setResponsables(responsablesAnteriores); // Revertir
      let errorMessage = "Error al eliminar responsable. El cambio fue revertido.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  // CORRECCIÓN: Usa un tipo parcial para los datos de creación
  const handleCreateResponsable = async (newResponsableData: Omit<Responsable, 'id_usuario' | 'id_rol'>) => {
    // Opcional: Validación básica en frontend
     if (!newResponsableData.nombre || !newResponsableData.apellidos || !newResponsableData.ci || !newResponsableData.email || !newResponsableData.area) {
         alert("Por favor, completa todos los campos requeridos.");
         return;
     }

    try {
      // No necesitamos setLoading(true) aquí si el modal ya lo indica
      setError("");

      // Usa el 'api' importado
      const response = await api.post("/responsable", newResponsableData);

      // Backend devuelve el usuario y el área creados/asignados
      if (response.data && response.data.usuario && response.data.area) {
        // Construye el objeto Responsable completo
        const nuevoResponsable: Responsable = {
          id_usuario: response.data.usuario.id_usuario,
          nombre: response.data.usuario.nombre,
          apellidos: response.data.usuario.apellidos,
          ci: response.data.usuario.ci,
          email: response.data.usuario.email,
          telefono: response.data.usuario.telefono,
          id_rol: response.data.usuario.id_rol,
          area: response.data.area.nombre // Usa el nombre del área devuelto
        };
        // Añade al estado local
        setResponsables((prev) => [...prev, nuevoResponsable]);
        alert("Responsable creado exitosamente");
        setIsCreateModalOpen(false); // Cierra el modal al éxito
      } else {
        // Si la respuesta no es la esperada, muestra error y recarga
        console.warn("Respuesta inesperada al crear responsable:", response.data);
        alert("Respuesta inesperada del servidor. Recargando lista...");
        fetchResponsables();
      }
    } catch (error: unknown) {
      console.error("Error al crear responsable:", error);
      let errorMessage = "Error al registrar el responsable.";
      if (axios.isAxiosError(error)) {
          // Muestra errores de validación específicos si existen
          const errors = error.response?.data?.errors;
          if (errors) {
              errorMessage = Object.values(errors).flat().join(' '); // Concatena todos los mensajes de error
          } else {
              errorMessage = error.response?.data?.message || error.message || errorMessage;
          }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      // No establezcas setError aquí si el modal maneja sus propios errores
      alert(errorMessage);
    } finally {
      // No necesitamos setLoading(false) si no lo activamos aquí
      // No cierres el modal aquí si quieres que permanezca abierto en caso de error
      // setIsCreateModalOpen(false);
    }
  };

  // --- Filtro ---
  const responsablesFiltrados = responsables.filter(
    (resp) =>
      resp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.ci.includes(filtro) ||
      resp.email.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.area.toLowerCase().includes(filtro.toLowerCase())
  );

  // --- Renderizado Condicional (Loading/Error) ---
  if (loading) {
    return (
      <div className="gestion-page-container"> {/* Clase genérica */}
        <div className="flex justify-center items-center p-8 text-lg">
          Cargando responsables...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-page-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchResponsables}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // --- Renderizado Principal ---
  return (
    <div className="gestion-page-container"> {/* Clase genérica */}
      {/* Barra de Búsqueda y Botón Nuevo */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Buscar (Nombre, CI, Email, Área)..."
              className="search-input"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <div className="search-icon">
              {/* SVG Icon */}
              <svg className="search-svg h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="primary-button" // Asegúrate que esta clase exista en tu CSS
        >
          {/* SVG Icon */}
          <svg className="button-icon h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Responsable</span>
        </button>
      </div>

      {/* Tabla de Responsables */}
      <ResponsableTable
        usuarios={responsablesFiltrados} // Pasar la lista filtrada
        onEdit={handleEditResponsable}
        onDelete={handleDeleteResponsable} // Pasar la función directamente
      />

      {/* Paginación / Info */}
      {responsables.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {responsablesFiltrados.length} de {responsables.length} responsables totales.
          </span>
          {/* Aquí irían los controles de paginación si los implementas */}
        </div>
      )}

       {/* Mensaje si no hay responsables */}
       {!loading && responsables.length === 0 && (
         <div className="text-center p-8 text-gray-500">
             No hay responsables registrados todavía.
         </div>
       )}

      {/* Modal para Crear (se reutiliza el de editar en modo 'creación') */}
      {/* Asegúrate que EditResponsableModal maneje 'usuario={null}' para modo creación */}
      <EditResponsableModal
        usuario={null} // Indica modo creación
        onSave={handleCreateResponsable}
        onCancel={() => setIsCreateModalOpen(false)}
        isOpen={isCreateModalOpen}
      />
    </div>
  );
};

export default GestionResponsables;
