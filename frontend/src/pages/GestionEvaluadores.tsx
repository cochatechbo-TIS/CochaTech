// src/pages/GestionEvaluadores.tsx
import React, { useState, useEffect, useCallback } from "react";
//import axios from "axios";
import { EvaluadorTable } from "../components/evaluadores/EvaluadorTable";
import { EditEvaluadorModal } from "../components/evaluadores/EditEvaluadorModal";
import type { Usuario } from "../interfaces/Usuario";

const GestionEvaluadores: React.FC = () => {
  // 1. ESTADOS
  const [evaluador, setEvaluador] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // URL base (cuando conectes la API)
  //const API_BASE = "http://localhost:8000/api";

  // 2. CONFIGURACIÓN AXIOS (solo la dejamos lista)
  //const api = axios.create({
  //  baseURL: API_BASE,
   // headers: {
   //   "Content-Type": "application/json",
   //   Accept: "application/json",
  //  },
  //});

  // 3. FUNCIÓN DE CARGA DE DATOS (simulada)
  const fetchEvaluadores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Simulando carga de evaluadores...");

      // 🔹 Aquí normalmente iría la llamada a tu API:
      // const response = await api.get("/evaluador");
      // const evaluadoresMapeados: Usuario[] = response.data.data.map((resp: Usuario) => ({
      //   id_usuario: resp.id_usuario,
      //   nombre: resp.nombre || "",
      //   apellidos: resp.apellidos || "",
      //   ci: resp.ci || "",
      //   email: resp.email || "",
      //   telefono: resp.telefono || null,
      //   area: resp.area || "",
      //   id_rol: resp.id_rol,
      // }));

      // 🔸 DATOS DE PRUEBA (mientras no tengas base de datos)
      const evaluadoresMapeados: Usuario[] = [
        {
          id_usuario: 1,
          nombre: "Andrea",
          apellidos: "Torrez Yañez",
          ci: "1234567",
          email: "andrea.torrez@example.com",
          telefono: "76543210",
          area: "Sistemas",
          id_rol: 3,
        },
        {
          id_usuario: 2,
          nombre: "Carlos",
          apellidos: "Pérez Gutiérrez",
          ci: "9876543",
          email: "carlos.perez@example.com",
          telefono: "78912345",
          area: "Administración",
          id_rol: 3,
        },
        {
          id_usuario: 3,
          nombre: "María",
          apellidos: "López Flores",
          ci: "4567890",
          email: "maria.lopez@example.com",
          telefono: "71234567",
          area: "Contabilidad",
          id_rol: 3,
        },
      ];

      // Asignar los datos de prueba
      setEvaluador(evaluadoresMapeados);
      console.log("Evaluadores simulados cargados:", evaluadoresMapeados);
    } catch (e) {
      console.error("Error simulando evaluadores:", e);
      setError("Error al cargar los evaluadores de prueba.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. CARGAR AL MONTAR EL COMPONENTE
  useEffect(() => {
    fetchEvaluadores();
  }, [fetchEvaluadores]);

  // 5. FUNCIONES DE EDICIÓN, ELIMINACIÓN Y CREACIÓN (también simuladas)
  const handleEditEvaluador = async (editedEvaluador: Usuario) => {
    console.log("Guardando edición (simulada):", editedEvaluador);

    // 🔹 En tu backend usarías:
    // await api.put(`/evaluadores/${editedEvaluador.id_usuario}`, editedEvaluador);

    setEvaluador((prev) =>
      prev.map((r) =>
        r.id_usuario === editedEvaluador.id_usuario ? editedEvaluador : r
      )
    );

    alert("Evaluador actualizado (simulación)");
  };

  const handleDeleteEvaluador = async (id: number) => {
    if (!window.confirm(`¿Eliminar evaluador ID ${id}?`)) return;

    console.log("Eliminando (simulada):", id);
    // 🔹 En tu backend usarías:
    // await api.delete(`/evaluador/${id}`);

    setEvaluador((prev) => prev.filter((r) => r.id_usuario !== id));
    alert("Evaluador eliminado (simulación)");
  };

  const handleCreateEvaluador = async (newEvaluador: Usuario) => {
    console.log("Creando nuevo evaluador (simulada):", newEvaluador);

    // 🔹 En tu backend usarías:
    // const response = await api.post("/evaluador", newEvaluador);

    const nuevo: Usuario = {
      ...newEvaluador,
      id_usuario: Date.now(), // ID temporal
      id_rol: 2,
    };

    setEvaluador((prev) => [...prev, nuevo]);
    setIsCreateModalOpen(false);
    alert("Evaluador agregado (simulación)");
  };

  // 6. FILTRO DE BÚSQUEDA
  const evaluadoresFiltrados = evaluador.filter(
    (resp) =>
      resp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.ci.includes(filtro) ||
      resp.email.toLowerCase().includes(filtro.toLowerCase()) ||
      resp.area.toLowerCase().includes(filtro.toLowerCase())
  );

  // 7. RENDERIZADO
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
            Mostrando {evaluadoresFiltrados.length} de {evaluador.length}{" "}
            evaluadores
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
