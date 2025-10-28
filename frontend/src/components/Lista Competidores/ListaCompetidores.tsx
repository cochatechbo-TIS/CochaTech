
// src/components/Lista Competidores/ListaCompetidores.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Listas.css';

// ========== MOCK ÁREAS ============
const AREAS_MOCK = ['Astronomía y Astrofisica', 'Matemáticas',
   'Robotica', 'Física', 'Biología', 'Química', 'Informática'];
// ========== INTERFACES ==========
interface Nivel {
  id: number;
  nombre: string;
  competidores: number;
  fasesAprobadas: number;
  faseTotal: number;
  evaluador: {
    id?: number;
    nombre: string;
  } | null;
}

interface ValidacionListasProps {
  area?: string;
}

// ========== CONSTANTES ==========
const AREA_DEFAULT = 'Todas las áreas';

// ========== DATOS MOCK ==========
const NIVELES_MOCK: Nivel[] = [
  {
    id: 1,
    nombre: 'Nivel 1',
    competidores: 24,
    fasesAprobadas: 2,
    faseTotal: 3,
    evaluador: { id: 1, nombre: 'Carlos Mendoza' }
  },
  {
    id: 2,
    nombre: 'Nivel 2',
    competidores: 18,
    fasesAprobadas: 1,
    faseTotal: 3,
    evaluador: { id: 2, nombre: 'Ana Pérez' }
  },
  {
    id: 3,
    nombre: 'Nivel 3',
    competidores: 12,
    fasesAprobadas: 1,
    faseTotal: 3,
    evaluador: null
  }
];

const NIVEL_AREA_MAP: Record<number, string> = {
  1: 'Robotica',
  2: 'Matemáticas',
  3: 'Física'
};
// ========== UTILIDADES ==========
const calcularProgreso = (aprobadas: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((aprobadas / total) * 100);
};


function filtrarNiveles(
  niveles: Nivel[],
  busqueda: string,
  filtroNivel: string,
  filtroArea: string
): 

Nivel[] {
  let resultado = niveles;

  if (filtroNivel) {
    resultado = resultado.filter(nivel => nivel.nombre === filtroNivel);
  }
  if (filtroArea) {
    resultado = resultado.filter(nivel => NIVEL_AREA_MAP[nivel.id] === filtroArea);
  }
  if (busqueda.trim()) {
    const searchLower = busqueda.toLowerCase().trim();
    resultado = resultado.filter(nivel =>
      nivel.nombre.toLowerCase().includes(searchLower) ||
      nivel.evaluador?.nombre.toLowerCase().includes(searchLower)
    );
  }
  return resultado;
}

// ========== COMPONENTE PRINCIPAL ==========
function Listas({ area = AREA_DEFAULT }: ValidacionListasProps) {
  const navigate = useNavigate();
  const [niveles] = useState<Nivel[]>(NIVELES_MOCK);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroArea, setFiltroArea] = useState('');

  const nivelesFiltrados = useMemo(
    () => filtrarNiveles(niveles, busqueda, filtroNivel, filtroArea),
    [niveles, busqueda, filtroNivel, filtroArea]
  );

  // ========== MANEJADORES DE EVENTOS ==========
  const handleBusquedaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  }, []);
  const handleNivelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroNivel(e.target.value);
  }, []);
  const handleAreaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroArea(e.target.value);
  }, []);

  const handleAsignarEvaluador = useCallback((nivelId: number) => {
    alert(`Funcionalidad de asignar evaluador en desarrollo para el nivel: ${nivelId}`);
  }, []);
  const handleCambiarEvaluador = useCallback((nivelId: number) => {
    alert(`Funcionalidad de cambiar evaluador en desarrollo para el nivel: ${nivelId}`);
  }, []);
  const handleGestionarFases = useCallback((nivelId: number) => {
    navigate('/evaluacion', { state: { nivelId } });
  }, [navigate]);
  
  /*const handleGestionarFases = useCallback((nivelId: number) => {
    navigate('/evaluacion', { state: { nivelId } });
  }, [navigate]);*/


  // ========== RENDER ==========
  return (
    <div className="validacion-container">
      {/* Header */}
      <div className="validacion-header">
        <h1 className="validacion-title">Validación de Listas</h1>
      </div>

      
{/* Filtros y buscador */}
      <div className="search-container">
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
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
              style={{ width: "500px" }}
            />
          </div>
          <select value={filtroNivel} onChange={handleNivelChange} className="filter-select">
            <option value="">Todos los niveles</option>
            {niveles.map(nivel => (
              <option key={nivel.id} value={nivel.nombre}>{nivel.nombre}</option>
            ))}
          </select>
          <select value={filtroArea} onChange={handleAreaChange} className="filter-select">
            <option value="">Todas las áreas</option>
            {AREAS_MOCK.map(areaOption => (
              <option key={areaOption} value={areaOption}>{areaOption}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <svg 
          className="info-icon" width="20" height="20" 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <div className="info-content">
          <h3 className="info-title">Validación de niveles para el área {area}</h3>
          <p className="info-text">
            Como responsable del área de {area}, usted puede gestionar todos los niveles asignados 
            y asignar evaluadores a cada nivel. Haga clic en "Gestionar fases" para ver y validar 
            las listas de cada nivel.
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <h2 className="validacion-subtitle">Área: {filtroArea || area}</h2>
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
                  No se encontraron areas que coincidan con "{busqueda || filtroArea}"
                </td>
              </tr>
            ) : (
              nivelesFiltrados.map((nivel) => (
                <tr key={nivel.id}>
                  {/* Nivel */}
                  <td className="centrado">
                    <strong>{nivel.nombre}</strong>
                  </td>
                  {/* Competidores */}
                  <td className="centrado">
                    <div className="competidores-cell">
                      <svg 
                        className="icon-competidores" width="18" height="18"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{nivel.competidores}</span>
                    </div>
                  </td>
                  {/* Progreso */}
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
                  {/* Evaluador */}
                  <td className="centrado">
                    {nivel.evaluador ? (
                      <div className="evaluador-cell">
                        <span className="evaluador-nombre">{nivel.evaluador.nombre}</span>
                        <button 
                          className="btn-cambiar"
                          onClick={() => handleCambiarEvaluador(nivel.id)}
                        >
                          (Cambiar)
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn-asignar"
                        onClick={() => handleAsignarEvaluador(nivel.id)}
                      >
                        <svg 
                          width="16" height="16"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        <span>Asignar evaluador</span>
                      </button>
                    )}
                  </td>
                  {/* Acciones */}
                  <td className="centrado">
                    <button 
                      className="btn-gestionar"
                      onClick={() => handleGestionarFases(nivel.id)}
                    >
                      Gestionar fases
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Listas;
>>>>>>> 2670955d7ac3bdee7d4d05b1ccfee0072b763857
