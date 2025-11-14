// src/components/Lista Competidores/ListaCompetidores.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Listas.css';
import axios from 'axios';
//import type { Nivel, ValidacionListasProps } from './tipo.ts'; // Asumiendo que 'tipo' está en el mismo directorio
import type { Nivel } from './tipo.ts';
import api from '../../services/api'; // <-- IMPORTAMOS LA INSTANCIA DE AXIOS

// ========== CONSTANTES ==========

// ========== COMPONENTE PRINCIPAL ==========
function Listas() {
  const navigate = useNavigate();

  // ========== ESTADOS ==========
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroArea] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [areaResponsable, setAreaResponsable] = useState<string>(''); // <-- NUEVO ESTADO
  const [areas, setAreas] = useState<string[]>([]);
  // --- NUEVOS ESTADOS PARA EL MODAL ---
  const [mensajeError, setMensajeError] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel | null>(null);
  const [evaluadoresDisponibles, setEvaluadoresDisponibles] = useState<any[]>([]);
  const [evaluadorSeleccionado, setEvaluadorSeleccionado] = useState<string>('');
  //-----------
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  // ========== USUARIO ==========
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.rol?.nombre_rol === 'administrador';
 
console.log('selectedArea:', selectedArea);
console.log('niveles:', niveles);
console.log('evaluadoresDisponibles:', evaluadoresDisponibles);

  // --- FUNCIÓN PARA LLAMAR AL BACKEND Y TRAER LOS EVALUADORES ---
  const fetchEvaluadoresPorArea = useCallback(async (areaId: number) => {
    try {
      const response = await api.get(`/evaluadores-por-area/${areaId}`);
      return response.data; // Devuelve la lista de evaluadores.
    } catch (error) {
      console.error("Error al cargar evaluadores:", error);
      return []; // Si falla, devuelve una lista vacía.
    }
  }, []);

  // --- FUNCIÓN PARA ABRIR EL MODAL ---
  const openModal = useCallback(async (nivel: Nivel) => {
    setNivelSeleccionado(nivel); // Guardamos en qué nivel hicimos click.
    setIsModalOpen(true); // Hacemos visible el modal.
    // Cargamos los evaluadores del área seleccionada.
    if (nivel.id_area) {
      try {
      const evaluadores = await fetchEvaluadoresPorArea(nivel.id_area);
      setEvaluadoresDisponibles(evaluadores); // Guardamos la lista de evaluadores.
      setEvaluadorSeleccionado(nivel.id_evaluador?.toString() || '');
    } catch (error) {
        console.error("Error al obtener evaluadores para el modal", error);
      }
    } else {
      console.error("El nivel seleccionado no tiene un id_area asociado");
    }
  }, [fetchEvaluadoresPorArea]);

  // --- FUNCIÓN PARA CERRAR EL MODAL ---
  const closeModal = useCallback(() => {
    setIsModalOpen(false); // Oculta el modal.
    setNivelSeleccionado(null);
    setEvaluadoresDisponibles([]);
    setEvaluadorSeleccionado('');
  }, []);

  // --- FUNCIÓN PARA GUARDAR EL CAMBIO (POST) ---
  const handleGuardarEvaluador = useCallback(async () => {
    // Validación: si no hay nada seleccionado, no hacemos nada.
    if (!nivelSeleccionado || !evaluadorSeleccionado) {
      setMensajeError("No se seleccionó ningún evaluador. Por favor seleccione un evaluador.");
      return;
    }
    setMensajeError('');
    const body = {
      id_nivel: nivelSeleccionado.id,
      id_evaluador: parseInt(evaluadorSeleccionado),
    };

    try {
  
      await api.post('/niveles/asignar-evaluador', body);

      // --- ACTUALIZACIÓN EN TIEMPO REAL ---
      const evaluadorElegido = evaluadoresDisponibles.find(ev => ev.id_evaluador === parseInt(evaluadorSeleccionado));
      const nombreCompletoEvaluador = evaluadorElegido ? `${evaluadorElegido.nombre} ${evaluadorElegido.apellidos}` : '';
      setNiveles(currentNiveles =>
        currentNiveles.map(nivel =>
          nivel.id === nivelSeleccionado.id
            ? { ...nivel, evaluador: nombreCompletoEvaluador, id_evaluador: parseInt(evaluadorSeleccionado) }
            : nivel
        )
      );

      closeModal(); // Cerramos el modal si todo salió bien.
    } catch (error) {
      console.error("Error al asignar evaluador:", error);
      alert("Ocurrió un error al guardar el evaluador.");
    }
  }, [nivelSeleccionado, evaluadorSeleccionado, evaluadoresDisponibles, closeModal]);

  // ========== CARGAR ÁREAS ==========
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await api.get('/areas/nombres');
        const soloNombres = response.data.map((a: any) => a.nombre);
        
        setAreas(soloNombres);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error('Error al cargar áreas:', err.response?.status, err.response?.data);
        } else {
          console.error(err);
        }
      }
    };
    fetchAreas();
  }, []);

  // ========== CARGAR NIVELES ==========
  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        console.log("isAdmin:", isAdmin);
        console.log("selectedArea:", selectedArea);

        let url = '';

        if (isAdmin) {
          if (!selectedArea) {
            console.warn('No se ha seleccionado un área. Se usará el área predeterminada.');
            return;
          }
          url = `/niveles/area/${selectedArea}`;
        } else {
          url = '/niveles/auth';
        }

        const token = localStorage.getItem('authToken');
        console.log('Token usado:', token);

        if (!token) {
          console.error('No hay token guardado en localStorage. Debes iniciar sesión.');
          return;
        }

        const response = await api.get(url);
        console.log('Respuesta completa del backend:', response.data);

        const nivelesRaw = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        if (!Array.isArray(nivelesRaw)) {
          console.error('La respuesta no es un array:', nivelesRaw);
          return;
        }

        const nivelesAdaptados: Nivel[] = nivelesRaw.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          competidores: item.competidores,
          fasesAprobadas: item.fasesAprobadas,
          faseTotal: item.faseTotales,
          evaluador: item.evaluador || '',
          id_evaluador: item.id_evaluador,
          area: item.area || '',
          id_area: item.id_area,
        }));

        // --- INICIO DE LA MODIFICACIÓN ---
        // Si no es admin y hay niveles, extraemos el área del primer nivel.
        if (!isAdmin && nivelesRaw.length > 0 && nivelesRaw[0].area) {
          setAreaResponsable(nivelesRaw[0].area);
        }
        setNiveles(nivelesAdaptados);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error('Error al cargar niveles:', err.response?.status, err.response?.data);
          if (err.response?.status === 401) {
            console.warn('Token inválido o expirado. Debes volver a iniciar sesión.');
          }
        } else {
          console.error(err);
        }
      }
    };
    fetchNiveles();
  }, [selectedArea, isAdmin]); // No es necesario añadir areaResponsable a las dependencias

  // ========== UTILIDADES ==========
  const calcularProgreso = (aprobadas: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((aprobadas / total) * 100);
  };

  const filtrarNiveles = (
    niveles: Nivel[],
    busqueda: string,
    filtroNivel: string,
    filtroArea: string
  ): Nivel[] => {
    let resultado = niveles;

    if (filtroNivel) {
      resultado = resultado.filter((nivel) => nivel.nombre === filtroNivel);
    }
    if (filtroArea) {
      // Aquí podrías filtrar por área si tu backend lo devuelve en cada nivel
    }
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase().trim();
      resultado = resultado.filter(
        (nivel) =>
          nivel.nombre.toLowerCase().includes(searchLower) ||
          nivel.evaluador.toLowerCase().includes(searchLower)
      );
    }
    return resultado;
  };

  const nivelesFiltrados = useMemo(
    () => filtrarNiveles(niveles, busqueda, filtroNivel, filtroArea),
    [niveles, busqueda, filtroNivel, filtroArea]
  );

  // ========== MANEJADORES ==========
  const handleBusquedaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  }, []);

  const handleNivelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroNivel(e.target.value);
  }, []);

  const handleAreaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArea(e.target.value);
  }, []);

  const handleOpenModalEvaluador = useCallback((nivel: Nivel) => {
    openModal(nivel);
  }, [openModal]);

  const handleGestionarFases = useCallback(
    (nivelId: number) => {
      navigate('/gestionar-fases', { state: { nivelId } });// AÑADIDO para el admin
    },
    [navigate]
  );


  // ========== RENDER ==========
  return (
    <div className="validacion-container">
      <div className="validacion-header">
        <h1 className="validacion-title">Validación de Listas</h1>
      </div>

      {/* Filtros y buscador */}
      <div className="search-container">
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nivel o evaluador..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className="search-input"
            />
          </div>
          
          {isAdmin && (
            <select value={selectedArea} onChange={handleAreaChange} className="filter-select">
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
          <select value={filtroNivel} onChange={handleNivelChange} className="filter-select">
            <option value="">Todos los niveles</option>
            {niveles.map(nivel => (
              <option key={nivel.id} value={nivel.nombre}>{nivel.nombre}</option>
            ))}
          </select>
          
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <div className="info-content">
          <h3 className="info-title">Validación de niveles para el área: {isAdmin ? selectedArea || '...' : areaResponsable || '...'}</h3>
          <p className="info-text">
            Como responsable, usted puede gestionar todos los niveles asignados a su área
            y asignar evaluadores. Haga clic en "Gestionar fases" para ver y validar 
            las listas de cada nivel.
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <h2 className="validacion-subtitle">Área: {isAdmin ? selectedArea || '...' : areaResponsable || '...'}</h2>
        <table className="niveles-table">
          <thead>
            <tr>
              <th className="centrado">NIVEL</th>
              <th className="centrado">COMPETIDORES</th>
              <th className="centrado">PROGRESO</th>
              <th className="centrado">EVALUADOR</th>
              <th className="centrado">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {nivelesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-message">
                  No se encontraron niveles que coincidan con "{busqueda}"
                </td>
              </tr>
            ) : (
              nivelesFiltrados.map((nivel) => (
                <tr key={nivel.id}>
                  <td className="centrado"><strong>{nivel.nombre}</strong></td>
                  <td className="centrado">
                    <div className="competidores-cell">
                      <svg className="icon-competidores" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{nivel.competidores}</span>
                    </div>
                  </td>
                  <td className="centrado">
                    <div className="progreso-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${calcularProgreso(nivel.fasesAprobadas, nivel.faseTotal)}%` }}
                        />
                      </div>
                      <span className="progreso-text">
                        {nivel.fasesAprobadas}/{nivel.faseTotal} fases aprobadas
                      </span>
                    </div>
                  </td>
            <td className="centrado">
                      {nivel.evaluador && nivel.evaluador.trim() !== '' ?
                        (
                          // ✅ SI hay evaluador → Mostrar nombre y opción de cambiar
                        <div className="evaluador-cell">
                          <span className="evaluador-nombre">{nivel.evaluador}</span>
                          <a 
                            href="#" 
                            className="btn-cambiar-texto" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              handleOpenModalEvaluador(nivel); 
                            }}
                          >
                            Cambiar evaluador
                          </a>
                        </div>
                      ):(
                        // ✅ NO hay evaluador → Mostrar botón de asignar
                        <button
                          className="btn-asignar-cambiar"
                          onClick={() => handleOpenModalEvaluador(nivel)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                          </svg>
                          Asignar Evaluador
                        </button>
                      )
                    }
                    </td>
                  <td className="centrado">
                    <button className="btn-gestionar" onClick={() => handleGestionarFases(nivel.id)}>
                      Gestionar fases
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
              </table>
    </div>

    {isModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">
            {nivelSeleccionado?.evaluador ? 'Cambiar Evaluador' : 'Asignar Evaluador'}
          </h2>
          <p className="modal-subtitle">
            Nivel: <strong>{nivelSeleccionado?.nombre}</strong>
          </p>
          {mensajeError && (
           <div className="modal-error">
          {mensajeError}
           </div>
          )}
          <div className="modal-field">
            <label htmlFor="evaluador-select">Seleccionar Evaluador:</label>
            <select
              id="evaluador-select"
              value={evaluadorSeleccionado}
              onChange={(e) => setEvaluadorSeleccionado(e.target.value)}
              className="modal-select"
            >
              <option value="" disabled>-- Elija una opción --</option>
              {evaluadoresDisponibles.map((evaluador) => (
                <option key={evaluador.id_evaluador} value={evaluador.id_evaluador}>
                  {evaluador.nombre} {evaluador.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button onClick={closeModal} className="btn-cancelar">
              Cancelar
            </button>
            <button onClick={handleGuardarEvaluador} className="btn-guardar">
              Guardar
            </button>
          </div>
        </div>
      </div>
    )}
  </div> 
);
}

export default Listas;