// src/pages/GestionEvaluadores.tsx
import React, { useState, useEffect, useCallback } from "react";
// CORRECCIÓN: Importa el api centralizado
import api from "../services/api";
// Mantenido SOLO para 'isAxiosError'
import axios from "axios";
import { EvaluadorTable } from "../components/evaluadores/EvaluadorTable";
import { EditEvaluadorModal } from "../components/evaluadores/EditEvaluadorModal";
// CORRECCIÓN: Importa el tipo específico
import type { Evaluador } from "../../types/User.types";

const GestionEvaluadores: React.FC = () => {
  // CORRECCIÓN: Usa el tipo 'Evaluador'
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- ELIMINADO ---
  // Ya no necesitamos API_BASE ni el useMemo para crear 'api' localmente
  // --- FIN ELIMINADO ---

  const fetchEvaluadores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Cargando evaluadores...");

      // Usa el 'api' importado directamente
      const response = await api.get("/evaluador");

      // CORRECCIÓN: Mapea a la interfaz 'Evaluador'
      // Ajusta según la respuesta REAL de tu API GET /evaluador
      const evaluadoresMapeados: Evaluador[] = response.data.data.map(
        (evaluador: any): Evaluador => ({ // Usar 'any' temporalmente
          id_usuario: evaluador.id_usuario,
          nombre: evaluador.nombre || "",
          apellidos: evaluador.apellidos || "",
          ci: evaluador.ci || "",
          email: evaluador.email || "",
          telefono: evaluador.telefono || null,
          area: evaluador.area || "", // Nombre del área
          id_rol: evaluador.id_rol, // Asegúrate que el backend lo envíe si lo necesitas
          // Campos específicos de Evaluador
          disponible: evaluador.disponible ?? true, // Asume true si no viene
          id_nivel: evaluador.id_nivel || null,
          nivel: evaluador.nivel || null, // Nombre del nivel
        })
      );

      console.log("Evaluadores cargados:", evaluadoresMapeados.length);
      setEvaluadores(evaluadoresMapeados);
    } catch (e: unknown) {
      console.error("Error fetching evaluadores:", e);
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
    fetchEvaluadores();
  }, [fetchEvaluadores]);

  // --- Manejadores de Acciones ---

  // CORRECCIÓN: Usa el tipo 'Evaluador'
  const handleEditEvaluador = async (editedEvaluador: Evaluador) => {
    console.log("Guardando edición de evaluador:", editedEvaluador);
    const evaluadoresAnteriores = [...evaluadores];

    try {
      // Optimistic update
      setEvaluadores(prev =>
        prev.map(r =>
          r.id_usuario === editedEvaluador.id_usuario ? editedEvaluador : r
        )
      );

      // Usa el 'api' importado
      await api.put(`/evaluador/${editedEvaluador.id_usuario}`, {
          // Enviar solo los campos editables esperados por el backend
          nombre: editedEvaluador.nombre,
          apellidos: editedEvaluador.apellidos,
          ci: editedEvaluador.ci, // Generalmente no editable, pero si lo es, envíalo
          email: editedEvaluador.email,
          telefono: editedEvaluador.telefono,
          // Asegúrate de enviar NOMBRE o ID según espere el backend
          area: editedEvaluador.area,
          nivel: editedEvaluador.nivel, // O id_nivel si el backend lo prefiere
          disponible: editedEvaluador.disponible,
      });

      alert('Evaluador actualizado correctamente.');
      // Opcional: fetchEvaluadores(); para recargar
    } catch (err: unknown) {
      console.error("Error al actualizar evaluador:", err);
      setEvaluadores(evaluadoresAnteriores); // Revertir
      let errorMessage = 'Error al actualizar evaluador. El cambio fue revertido.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  const handleDeleteEvaluador = async (id_usuario: number) => {
    const evaluadorAEliminar = evaluadores.find(e => e.id_usuario === id_usuario);
    if (!evaluadorAEliminar) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${evaluadorAEliminar.nombre} ${evaluadorAEliminar.apellidos}?`)) {
      return;
    }

    const evaluadoresAnteriores = [...evaluadores];
    try {
      // Optimistic update
      setEvaluadores(prev => prev.filter(r => r.id_usuario !== id_usuario));

      // Usa el 'api' importado
      await api.delete(`/evaluador/${id_usuario}`);
      alert("Evaluador eliminado exitosamente.");

    } catch (err: unknown) {
      console.error("Error al eliminar evaluador:", err);
      setEvaluadores(evaluadoresAnteriores); // Revertir
      let errorMessage = "Error al eliminar evaluador. El cambio fue revertido.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  // CORRECCIÓN: Usa un tipo parcial para los datos de creación
  const handleCreateEvaluador = async (newEvaluadorData: Omit<Evaluador, 'id_usuario' | 'id_rol'>) => {
    // Opcional: Validación básica en frontend
     if (!newEvaluadorData.nombre || !newEvaluadorData.apellidos || !newEvaluadorData.ci || !newEvaluadorData.email || !newEvaluadorData.area) {
         alert("Por favor, completa los campos requeridos (Nombre, Apellidos, CI, Email, Área).");
         return;
     }

    try {
      // No necesitamos setLoading(true) si el modal lo indica
      setError("");

      // Usa el 'api' importado
      // Enviar los datos que espera el endpoint POST /evaluador
      const response = await api.post("/evaluador", {
          nombre: newEvaluadorData.nombre,
          apellidos: newEvaluadorData.apellidos,
          ci: newEvaluadorData.ci,
          email: newEvaluadorData.email,
          telefono: newEvaluadorData.telefono,
          // Asegúrate de enviar NOMBRE o ID según espere el backend
          area: newEvaluadorData.area,
          nivel: newEvaluadorData.nivel, // O id_nivel si el backend lo prefiere
          disponible: newEvaluadorData.disponible ?? true, // Valor por defecto
      });

      // El backend devuelve el usuario y el evaluador creados
      if (response.data && response.data.usuario && response.data.evaluador) {
        // Construye el objeto Evaluador completo
        const nuevoEvaluador: Evaluador = {
            id_usuario: response.data.usuario.id_usuario,
            nombre: response.data.usuario.nombre,
            apellidos: response.data.usuario.apellidos,
            ci: response.data.usuario.ci,
            email: response.data.usuario.email,
            telefono: response.data.usuario.telefono,
            id_rol: response.data.usuario.id_rol,
            // Datos específicos del evaluador devueltos
            area: response.data.evaluador.area?.nombre || newEvaluadorData.area, // Usa la respuesta si existe
            nivel: response.data.evaluador.nivel?.nombre || newEvaluadorData.nivel, // Usa la respuesta si existe
            id_nivel: response.data.evaluador.id_nivel,
            disponible: response.data.evaluador.disponible,
        };
        // Añade al estado local
        setEvaluadores((prev) => [...prev, nuevoEvaluador]);
        alert("Evaluador creado exitosamente");
        setIsCreateModalOpen(false); // Cierra el modal
      } else {
        console.warn("Respuesta inesperada al crear evaluador:", response.data);
        alert("Respuesta inesperada del servidor. Recargando lista...");
        fetchEvaluadores(); // Recarga por si acaso
      }
    } catch (error: unknown) {
      console.error("Error al crear evaluador:", error);
      let errorMessage = "Error al registrar el evaluador.";
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors) {
            errorMessage = Object.values(errors).flat().join(' ');
        } else {
            errorMessage = error.response?.data?.message || error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
      // No establezcas setError aquí si el modal maneja sus errores
    } finally {
      // No necesitamos setLoading(false) aquí
      // No cierres el modal si quieres que siga abierto en error
      // setIsCreateModalOpen(false);
    }
  };

  // --- Filtro ---
  const evaluadoresFiltrados = evaluadores.filter(
    (evaluador) =>
      evaluador.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      evaluador.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      evaluador.ci.includes(filtro) ||
      evaluador.email.toLowerCase().includes(filtro.toLowerCase()) ||
      evaluador.area.toLowerCase().includes(filtro.toLowerCase()) ||
      (evaluador.nivel && evaluador.nivel.toLowerCase().includes(filtro.toLowerCase()))
  );

  // --- Renderizado Condicional (Loading/Error) ---
  if (loading) {
    return (
      <div className="gestion-page-container"> {/* Clase genérica */}
        <div className="flex justify-center items-center p-8 text-lg">
          Cargando evaluadores...
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
            onClick={fetchEvaluadores}
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
              placeholder="Buscar (Nombre, CI, Email, Área, Nivel)..."
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
          className="primary-button" // Asegúrate que esta clase exista
        >
          {/* SVG Icon */}
          <svg className="button-icon h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Evaluador</span>
        </button>
      </div>

      {/* Tabla de Evaluadores */}
      <EvaluadorTable
        usuarios={evaluadoresFiltrados} // Pasar la lista filtrada
        onEdit={handleEditEvaluador}
        onDelete={handleDeleteEvaluador} // Pasar la función directamente
      />

      {/* Paginación / Info */}
      {evaluadores.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {evaluadoresFiltrados.length} de {evaluadores.length} evaluadores totales.
          </span>
          {/* Aquí irían los controles de paginación si los implementas */}
        </div>
      )}

       {/* Mensaje si no hay evaluadores */}
       {!loading && evaluadores.length === 0 && (
         <div className="text-center p-8 text-gray-500">
             No hay evaluadores registrados todavía.
         </div>
       )}

      {/* Modal para Crear (se reutiliza el de editar en modo 'creación') */}
      {/* Asegúrate que EditEvaluadorModal maneje 'usuario={null}' */}
      <EditEvaluadorModal
        usuario={null} // Indica modo creación
        onSave={handleCreateEvaluador}
        onCancel={() => setIsCreateModalOpen(false)}
        isOpen={isCreateModalOpen}
      />
    </div>
  );
};

export default GestionEvaluadores;
