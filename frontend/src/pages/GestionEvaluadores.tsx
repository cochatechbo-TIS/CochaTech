// src/pages/GestionEvaluadores.tsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import axios from "axios";
import { EvaluadorTable } from "../components/evaluadores/EvaluadorTable";
import { EditEvaluadorModal } from "../components/evaluadores/EditEvaluadorModal";

// CORRECCIÓN: Importa el tipo específico
import type { Evaluador } from "../types/User.types";

const GestionEvaluadores: React.FC = () => {
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchEvaluadores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Cargando evaluadores...");

      const response = await api.get("/evaluador");

      // Mapeo actualizado (sin nivel/disponible)
      const evaluadoresMapeados: Evaluador[] = response.data.data.map(
        (ev: any): Evaluador => ({ 
          id_usuario: ev.id_usuario,
          nombre: ev.nombre || "",
          apellidos: ev.apellidos || "",
          ci: ev.ci || "",
          email: ev.email || "",
          telefono: ev.telefono || null,
          area: ev.area || "", 
          id_rol: ev.id_rol,
          // nivel: ev.nivel || null,      <-- ELIMINADO
          // id_nivel: ev.id_nivel || null,  <-- ELIMINADO
          // disponible: ev.disponible,    <-- ELIMINADO
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
        }
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluadores();
  }, [fetchEvaluadores]);


  const handleEditEvaluador = async (editedEvaluador: Evaluador) => {
    console.log("Guardando edición de evaluador:", editedEvaluador);
    const evaluadoresAnteriores = [...evaluadores];

    try {
      setEvaluadores(prev =>
        prev.map(e =>
          e.id_usuario === editedEvaluador.id_usuario ? editedEvaluador : e
        )
      );

      // El objeto 'editedEvaluador' ya no tiene nivel/disponible
      await api.put(`/evaluador/${editedEvaluador.id_usuario}`, {
        nombre: editedEvaluador.nombre,
        apellidos: editedEvaluador.apellidos,
        ci: editedEvaluador.ci,
        email: editedEvaluador.email,
        telefono: editedEvaluador.telefono,
        area: editedEvaluador.area,
      });

      alert('Evaluador actualizado correctamente.');
    } catch (err: unknown) {
      console.error("Error al actualizar evaluador:", err);
      setEvaluadores(evaluadoresAnteriores); 
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
      setEvaluadores(prev => prev.filter(e => e.id_usuario !== id_usuario));
      await api.delete(`/evaluador/${id_usuario}`);
      alert("Evaluador eliminado exitosamente.");
    } catch (err: unknown) {
      console.error("Error al eliminar evaluador:", err);
      setEvaluadores(evaluadoresAnteriores);
      let errorMessage = "Error al eliminar evaluador. El cambio fue revertido.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  // El tipo de 'newEvaluadorData' ya no tendrá nivel/disponible
  const handleCreateEvaluador = async (newEvaluadorData: Omit<Evaluador, 'id_usuario' | 'id_rol'>) => {
     if (!newEvaluadorData.nombre || !newEvaluadorData.apellidos || !newEvaluadorData.ci || !newEvaluadorData.email || !newEvaluadorData.area) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
     }

    try {
      setError("");
      
      // El 'newEvaluadorData' enviado ya no tiene nivel/disponible
      const response = await api.post("/evaluador", newEvaluadorData);

      if (response.data && response.data.usuario && response.data.evaluador) {
        // Construye el objeto Evaluador completo (sin nivel/disponible)
        const nuevoEvaluador: Evaluador = {
          id_usuario: response.data.usuario.id_usuario,
          nombre: response.data.usuario.nombre,
          apellidos: response.data.usuario.apellidos,
          ci: response.data.usuario.ci,
          email: response.data.usuario.email,
          telefono: response.data.usuario.telefono,
          id_rol: response.data.usuario.id_rol,
          // El backend ahora devuelve 'area' en el controlador
          area: response.data.evaluador.id_area ? newEvaluadorData.area : '', 
        };
        setEvaluadores((prev) => [...prev, nuevoEvaluador]);
        alert("Evaluador creado exitosamente");
        setIsCreateModalOpen(false); 
      } else {
        console.warn("Respuesta inesperada al crear evaluador:", response.data);
        alert("Respuesta inesperada del servidor. Recargando lista...");
        fetchEvaluadores();
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
    }
  };


  const evaluadoresFiltrados = evaluadores.filter(
    (ev) =>
      ev.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      ev.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      ev.ci.includes(filtro) ||
      ev.email.toLowerCase().includes(filtro.toLowerCase()) ||
      ev.area.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return (
      <div className="gestion-page-container">
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

  return (
    <div className="gestion-page-container">
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
              <svg className="search-svg h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="primary-button"
        >
          <svg className="button-icon h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Evaluador</span>
        </button>
      </div>

      <EvaluadorTable
        usuarios={evaluadoresFiltrados}
        onEdit={handleEditEvaluador}
        onDelete={handleDeleteEvaluador}
      />

      {evaluadores.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {evaluadoresFiltrados.length} de {evaluadores.length} evaluadores totales.
          </span>
        </div>
      )}

       {!loading && evaluadores.length === 0 && (
         <div className="text-center p-8 text-gray-500">
             No hay evaluadores registrados todavía.
         </div>
       )}

      <EditEvaluadorModal

        evaluador={null} // Indica modo creación
        onSave={handleCreateEvaluador}
        onCancel={() => setIsCreateModalOpen(false)}
        isOpen={isCreateModalOpen}
      />
    </div>
  );
};

export default GestionEvaluadores;