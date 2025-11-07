// src/pages/GestionFasesAdmin.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import api from "../services/api";
import type { FasePestana, InfoNivelAdmin, Participante } from "../interfaces/Evaluacion";
import "./evaluacion.css";
import { User, Users } from 'lucide-react';
import axios from 'axios';
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
      else {
        setError("Este nivel aún no tiene fases. El evaluador debe crear la primera fase.");
      }
    } catch (error) {
      console.error("Error al cargar fases:", error);
      let errorMsg = "Error al cargar las fases";
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
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

      console.log("🔍 Cargando participantes para fase:", idNivelFase);

      const response = await api.get(`/fase/${idNivelFase}`);
      console.log("✅ Respuesta de participantes:", response.data);

      const data = response.data;
      
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
        return { ...prev, nombre: data.nivel, area: data.area, esGrupal: esGrupal, evaluador: prev?.evaluador || "Cargando..." };
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
    if (!faseSeleccionada || !nivelId) return;
    if (!confirm("¿Está seguro de aprobar esta fase? Esta acción generará la siguiente fase con los participantes clasificados.")) return;
    
    try {
      // --- INICIO DE LA MODIFICACIÓN ---
      // En lugar de solo aprobar, llamamos al endpoint que crea la siguiente fase.
      // Este controlador se encarga de aprobar la fase actual y generar la nueva.
      const response = await api.post(`/fase-nivel/siguiente/${nivelId}`);
      alert(response.data.message || "Siguiente fase generada correctamente.");
      // --- FIN DE LA MODIFICACIÓN ---

      cargarFases(); // Recargar para ver el nuevo estado
    } catch (error) {
      console.error("Error al aprobar:", error);
      let errorMsg = "Error al aprobar y generar la siguiente fase.";
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.error || error.response?.data?.message || errorMsg;
      }
      alert(errorMsg);
    }
  };
  
  const handleRechazar = async () => {
    if (!faseSeleccionada) return;
    const comentario = prompt("Ingrese el motivo del rechazo:");
    if (!comentario) return;
    
    try {
      await api.post(`/nivel-fase/rechazar/${faseSeleccionada.id_nivel_fase}`, {
        comentario
      });
      alert("Fase rechazada correctamente");
      cargarFases();
    } catch (error) {
      console.error("Error al rechazar:", error);
      let errorMsg = "Error al rechazar la fase";
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
    alert(errorMsg);
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="evaluacion-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>⏳ Cargando información...</p>
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
    <div className="evaluacion-container">
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
      <div className="info-olimpistas-conteo">
              <Users className="info-icon" />
              <span>{participantes.length} participantes en esta fase</span>
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
      
      {/* Botones de acción */}
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
  );
};

export default GestionFasesAdmin;