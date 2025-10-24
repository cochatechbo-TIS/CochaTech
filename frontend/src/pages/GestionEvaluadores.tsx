// src/pages/GestionEvaluadores.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { EvaluadorTable } from "../components/evaluadores/EvaluadorTable"; // Asegúrate de que este componente exista
import { EditEvaluadorModal } from "../components/evaluadores/EditEvaluadorModal"; // Asegúrate de que este componente exista
import type { Usuario } from "../interfaces/Usuario";

const GestionEvaluadores: React.FC = () => {
  // 1. ESTADOS
  const [evaluadores, setEvaluadores] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const API_BASE = "http://localhost:8000/api"; // URL base de la API

  // 2. CONFIGURACIÓN AXIOS CON AUTH
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

  // 3. FUNCIÓN DE CARGA DE DATOS
  const fetchEvaluadores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

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
          disponible: evaluador.disponible ?? true,
          id_nivel: evaluador.id_nivel || null,
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
  }, [api]);

  // 4. EJECUTAR LA CARGA AL MONTAR
  useEffect(() => {
    fetchEvaluadores();
  }, [fetchEvaluadores]);

  // 5. MANEJADORES DE ACCIONES

  // Función de edición (usando optimistic updates)
  const handleEditEvaluador = async (editedEvaluador: Usuario) => {
    console.log("Guardando edición de evaluador:", editedEvaluador);

    const evaluadoresAnteriores = [...evaluadores];

    try {
      // Optimistic update
      setEvaluadores(prev =>
        prev.map(r =>
          r.id_usuario === editedEvaluador.id_usuario ? editedEvaluador : r
        )
      );

      // RUTA DE EDICIÓN PARA EVALUADOR
      await api.put(`/evaluador/${editedEvaluador.id_usuario}`, editedEvaluador);

      alert('Evaluador actualizado correctamente.');
    } catch (err: unknown) {
      console.error("Error al actualizar evaluador:", err);

      setEvaluadores(evaluadoresAnteriores); // Revertir

      let errorMessage = 'Error al actualizar evaluador. El cambio fue revertido.';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      alert(errorMessage);
    }
  };

  // Función de eliminación (usando optimistic updates)
  const handleDeleteEvaluador = async (id: number) => {
    const evaluadoresAnteriores = [...evaluadores];
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al evaluador?`)) {
      return;
    }

    try {
      // Optimistic update
      setEvaluadores(prev => prev.filter(r => r.id_usuario !== id));

      // RUTA DE ELIMINACIÓN PARA EVALUADOR
      await api.delete(`/evaluador/${id}`);
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


  // Función de creación
  const handleCreateEvaluador = async (newEvaluador: Usuario) => {
    try {
      setLoading(true);
      setError("");

      // RUTA DE CREACIÓN PARA EVALUADOR - ENVIANDO DATOS ESPECÍFICOS
      const response = await api.post("/evaluador", {
        nombre: newEvaluador.nombre,
        apellidos: newEvaluador.apellidos,
        ci: newEvaluador.ci,
        email: newEvaluador.email,
        telefono: newEvaluador.telefono,
        area: newEvaluador.area, 
        id_nivel: newEvaluador.id_nivel, // Campo de Evaluador
        disponible: newEvaluador.disponible ?? true, // Campo de Evaluador
        id_rol: 3, // Asumiendo que 3 es el ID de rol para Evaluador
      });

      if (response.data) {
        // Asignar el ID (idealmente el devuelto por el servidor) y agregarlo
        const evaluadorCreado: Usuario = {
            ...newEvaluador,
            id_usuario: response.data.data?.id_usuario || Date.now(), // Usar el ID del servidor si existe
            id_rol: 3,
        };
        setEvaluadores((prev) => [...prev, evaluadorCreado]);
        alert("Evaluador creado exitosamente");
      } else {
        alert("No se recibió confirmación del servidor.");
      }

    } catch (error: unknown) {
      console.error("Error al crear evaluador:", error);

      let errorMessage = "Error al registrar el evaluador.";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setIsCreateModalOpen(false);
      setLoading(false);
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

        {/* 🧾 TABLA */}
        <EvaluadorTable
          usuario={evaluadoresFiltrados}
          onEdit={handleEditEvaluador}
          onDelete={handleDeleteEvaluador}
        />
      </div>

      {/* 📄 PIE DE PÁGINA */}
      {evaluadoresFiltrados.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {evaluadoresFiltrados.length} de {evaluadores.length} evaluadores
          </span>
        </div>
      )}

      {/* ➕ MODAL CREAR */}
      <EditEvaluadorModal
        usuario={null}
        onSave={handleCreateEvaluador}
        onCancel={() => setIsCreateModalOpen(false)}
        isOpen={isCreateModalOpen}
      />
    </div>
  );
};

export default GestionEvaluadores;