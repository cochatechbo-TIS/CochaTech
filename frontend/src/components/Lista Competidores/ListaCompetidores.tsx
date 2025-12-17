// src/components/Lista Competidores/ListaCompetidores.tsx
import { useState, useCallback, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import './Listas.css';
//import type { Nivel, ValidacionListasProps } from './tipo.ts'; // Asumiendo que 'tipo' está en el mismo directorio
import type { Nivel } from './tipo.ts';
import api from '../../services/api'; // <-- IMPORTAMOS LA INSTANCIA DE AXIOS
import { useFiltrosAreaNivel } from '../../hooks/useFiltrosAreaNivel';
import FiltrosAreaNivel from '../filtrosAreaNivel/FiltrosAreaNivel';

// ========== COMPONENTE PRINCIPAL ==========
function Listas() {
  const navigate = useNavigate();

  interface Evaluador {
  id_evaluador: number;
  nombre: string;
  apellidos: string;
  }

  // ========== ESTADOS ==========
  const [busqueda, setBusqueda] = useState('');
  // --- NUEVOS ESTADOS PARA EL MODAL ---
  const [mensajeError, setMensajeError] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel | null>(null);
  const [evaluadoresDisponibles, setEvaluadoresDisponibles] = useState<Evaluador[]>([]);
  const [evaluadorSeleccionado, setEvaluadorSeleccionado] = useState<string>('');
  //-----------
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  // ========== USUARIO ==========
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.rol?.nombre_rol === 'administrador';
  const {
  areas,
  niveles,
  selectedArea,
  selectedNivel,
  handleAreaChange,
  handleNivelChange,
  nivelesCompletos,
  setNivelesCompletos
} = useFiltrosAreaNivel(isAdmin);


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
      const evaluadorElegido = evaluadoresDisponibles.find(
        ev => ev.id_evaluador === parseInt(evaluadorSeleccionado)
      );
      const nombreCompletoEvaluador = evaluadorElegido ? `${evaluadorElegido.nombre} ${evaluadorElegido.apellidos}` : '';
      setNivelesCompletos((prev: Nivel[]) =>
        prev.map((nivel: Nivel) =>
          nivel.id === nivelSeleccionado.id
            ? { 
              ...nivel,
              evaluador: nombreCompletoEvaluador,
              id_evaluador: parseInt(evaluadorSeleccionado)
            }
          : nivel
        )
      );

      closeModal(); // Cerramos el modal si todo salió bien.
    } catch (error) {
      console.error("Error al asignar evaluador:", error);
      alert("Ocurrió un error al guardar el evaluador.");
    }
  }, [nivelSeleccionado, evaluadorSeleccionado, evaluadoresDisponibles, closeModal, setNivelesCompletos]);

   // ========== UTILIDADES ==========
  const calcularProgreso = (aprobadas: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((aprobadas / total) * 100);
  };

  const filtrarNiveles = useCallback(
    (
      niveles: Nivel[],
      busqueda: string,
    ): Nivel[] => {
      let resultado = niveles;

    if (selectedNivel) {
      resultado = resultado.filter((nivel) => nivel.nombre === selectedNivel);
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
  },
    [selectedNivel]
);

  const nivelesFiltrados = useMemo(
    () => filtrarNiveles(nivelesCompletos, busqueda),
    [nivelesCompletos, busqueda, filtrarNiveles]
  );

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
        <p className="page-subtitle">
          {isAdmin? (
            <>Como administrador, usted puede visualizar todas las listas y niveles de todas las áreas. 
              No tiene permisos para aprobar, rechazar o asignar evaluadores.</>
          ) : (
            <>Como responsable, usted puede gestionar los niveles asignados a su área
            y asignar evaluadores. Haga clic en "Gestionar fases" para ver y validar 
            las listas de cada nivel.</>
          )}
          </p>
      </div>

      <FiltrosAreaNivel
        areas={areas}
        niveles={niveles}
        selectedArea={selectedArea}
        selectedNivel={selectedNivel}
        onAreaChange={handleAreaChange}
        onNivelChange={handleNivelChange}
        showBusqueda={true}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        placeholderBusqueda="Buscar por nivel o evaluador..."
        isAdmin={isAdmin}
      />

      {/* Tabla */}
      <h2 className="validacion-subtitle">Área: {isAdmin ? selectedArea || '...' : nivelesCompletos[0]?.area || '...'}</h2>
      <div className="tabla-container">
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
              nivelesFiltrados.map((nivel: Nivel) => (
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
                          style={{ width: `${calcularProgreso(nivel.fasesAprobadas, nivel.faseTotales)}%` }}
                        />
                      </div>
                      <span className="progreso-text">
                        {nivel.fasesAprobadas}/{nivel.faseTotales} fases aprobadas
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
                            className={`btn-cambiar-texto ${isAdmin ? 'btn-disabled-text' : ''}`}
                            onClick={(e) => { 
                              e.preventDefault(); 
                              if(isAdmin) return;
                              handleOpenModalEvaluador(nivel); 
                            }}
                          >
                            Cambiar evaluador
                          </a>
                        </div>
                      ):(
                        // ✅ NO hay evaluador → Mostrar botón de asignar
                        <button
                          className={`btn-asignar-cambiar ${isAdmin ? 'btn-disabled' : ''}`}
                          disabled={isAdmin}
                          onClick={() => {
                            if(isAdmin) return;
                            handleOpenModalEvaluador(nivel)}}
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