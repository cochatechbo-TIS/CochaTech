// src/components/Lista Competidores/ListaCompetidores.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Listas.css';
import type { Nivel, ValidacionListasProps } from './tipo';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

// ========== CONSTANTES ==========
const AREA_DEFAULT = 'Robótica';

// ========== COMPONENTE PRINCIPAL ==========
function Listas({ area = AREA_DEFAULT }: ValidacionListasProps) {
  const navigate = useNavigate();

  // ========== ESTADOS ==========
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroArea] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [areas, setAreas] = useState<string[]>([]);

  // ========== USUARIO ==========
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.rol?.nombre_rol === 'administrador';

  // ========== AXIOS INSTANCE ==========
  const API_BASE = 'http://localhost:8000/api';
  const api: AxiosInstance = useMemo(() => {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return axios.create({ baseURL: API_BASE, headers });
  }, []);

  // ========== CARGAR ÁREAS ==========
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await api.get('/areas/nombres');
        setAreas(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error('Error al cargar áreas:', err.response?.status, err.response?.data);
        } else {
          console.error(err);
        }
      }
    };
    fetchAreas();
  }, [api]);

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
        }));

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
  }, [api, selectedArea, isAdmin]);

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

  const handleAsignarEvaluador = useCallback((nivelId: number) => {
    alert(`Funcionalidad de cambiar evaluador en desarrollo para el nivel: ${nivelId}`);
}, []);


  const handleCambiarEvaluador = useCallback((nivelId: number) => {
    alert(`Funcionalidad de cambiar evaluador en desarrollo para el nivel: ${nivelId}`);
  }, []);

  const handleGestionarFases = useCallback(
    (nivelId: number) => {
      navigate('/evaluacion', { state: { nivelId } });
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
          <select value={filtroNivel} onChange={handleNivelChange} className="filter-select">
            <option value="">Todos los niveles</option>
            {niveles.map(nivel => (
              <option key={nivel.id} value={nivel.nombre}>{nivel.nombre}</option>
            ))}
          </select>
          {isAdmin && (
            <select value={selectedArea} onChange={handleAreaChange} className="filter-select">
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
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
          <h3 className="info-title">Validación de niveles para el área {selectedArea || area}</h3>
          <p className="info-text">
            Como responsable del área de {area}, usted puede gestionar todos los niveles asignados 
            y asignar evaluadores a cada nivel. Haga clic en "Gestionar fases" para ver y validar 
            las listas de cada nivel.
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <h2 className="validacion-subtitle">Área: {selectedArea || area}</h2>
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
                    {nivel.evaluador ? (
                      <div className="evaluador-cell">
                        <span className="evaluador-nombre">{nivel.evaluador}</span>
                        <button className="btn-cambiar" onClick={() => handleCambiarEvaluador(nivel.id)}>
                          (Cambiar)
                        </button>
                      </div>
                    ) : (
                      <button className="btn-asignar" onClick={() => handleAsignarEvaluador(nivel.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        <span>Asignar evaluador</span>
                      </button>
                    )}
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
    </div>
  );
}

export default Listas;
