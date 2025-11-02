/* eslint-disable no-irregular-whitespace */
// src/pages/GestionCompetidores.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { CompetitorTable } from '../components/competidores/CompetitorTable';
import CargarCSV from '../components/carga masiva/CargarCSV';
import type { Competidor } from '../interfaces/Competidor';

// Mapa de departamentos
const departamentosMapReverse: { [key: number]: string } = {
  1: 'La Paz',
  2: 'Santa Cruz', 
  3: 'Cochabamba',
  4: 'Oruro',
  5: 'Potosí',
  6: 'Chuquisaca',
  7: 'Tarija',
  8: 'Beni',
  9: 'Pando'
};
const COMPETIDORES_POR_PAGINA = 20;

const GestionCompetidores: React.FC = () => {
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1); //nuevo estado de paginacion

  // URL base de la API
  const API_BASE = 'http://localhost:8000/api';

  const api = React.useMemo(() => {
      // 1. Obtener el token del almacenamiento local
      const token = localStorage.getItem('authToken'); 
      
      const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
      };

      // 2. Si el token existe, añade el header de Autorización
      if (token) {
          headers['Authorization'] = `Bearer ${token}`; 
      }

      return axios.create({
          baseURL: API_BASE,
          headers: headers, // Usamos el nuevo objeto headers
      });
  }, [API_BASE]); 

  const fetchCompetidores = useCallback(async () => {

    try {
      setLoading(true);
      setError('');
      setPaginaActual(1); // Resetear a la primera página al recargar

      console.log('Cargando competidores...');
      const response = await api.get('/olimpistas');
      
      // Mapear los datos del backend a nuestra interfaz
      const competidoresMapeados = response.data.data.map((olimpista: Competidor) => ({
        id_olimpista: olimpista.id_olimpista, // <-- ¡Asegúrate de que el backend envíe este campo!
        ci: olimpista.ci || '',
        nombre: olimpista.nombre || '',
        apellidos: olimpista.apellidos || '',
        institucion: olimpista.institucion || '',
        area: olimpista.area || '',
        nivel: olimpista.nivel || '',
        gradoEscolaridad: olimpista.grado || '',
        grado: olimpista.grado || '',
        contacto_tutor: olimpista.contacto_tutor || '',
        nombre_tutor: olimpista.nombre_tutor || '',
        id_departamento: olimpista.id_departamento,
        departamento: olimpista.departamento,
        departamentoNombre: olimpista.departamento?.nombre_departamento || 
                           departamentosMapReverse[olimpista.id_departamento] || 
                           ''
      }));
      
      console.log('Competidores cargados:', competidoresMapeados.length);
      setCompetidores(competidoresMapeados);
      
    } catch (err: unknown) {
      console.error('Error fetching competidores:', err);
      
      let errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || 
                      err.message || 
                      errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  }, [api]);

  // Cargar competidores solo al montar el componente

  useEffect(() => {
    fetchCompetidores();
  }, [fetchCompetidores]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);


  // OPTIMIZADO: Actualizar competidor (ACTUALIZACIÓN LOCAL INMEDIATA)

  const handleEditCompetitor = async (editedCompetitor: Competidor) => {
    // ... (mantén tu código existente de handleEditCompetitor)
    const competidoresAnteriores = [...competidores]; 
    
    try {
      const competidoresActualizados = competidores.map(comp => 
        comp.ci === editedCompetitor.ci  
          ? { 
              ...editedCompetitor,
              departamentoNombre: editedCompetitor.departamentoNombre || 
                                departamentosMapReverse[editedCompetitor.id_departamento] || 
                                ''
            }
          : comp
      );
      
      setCompetidores(competidoresActualizados);

      const response = await api.put(`/olimpistas/${editedCompetitor.id_olimpista}`, {
        ci: editedCompetitor.ci,
        nombre: editedCompetitor.nombre,
        institucion: editedCompetitor.institucion,
        apellidos: editedCompetitor.apellidos, // <<< Campo nuevo en PUT
        area: editedCompetitor.area,
        nivel: editedCompetitor.nivel,
        grado: editedCompetitor.grado,
        nombre_tutor: editedCompetitor.nombre_tutor,
        contacto_tutor: editedCompetitor.contacto_tutor,
        id_departamento: editedCompetitor.id_departamento
      });

      if (response.data.data) {
        const competidorActualizado = response.data.data;
        const competidoresFinales = competidoresActualizados.map(comp => 
          comp.ci === editedCompetitor.ci 
            ? { 
                ...comp,
                ...competidorActualizado,
                departamentoNombre: competidorActualizado.departamento?.nombre_departamento || 
                                  departamentosMapReverse[competidorActualizado.id_departamento] || 
                                  editedCompetitor.departamentoNombre
              }
            : comp
        );
        setCompetidores(competidoresFinales);
      }


      alert('Competidor actualizado exitosamente');
      
    } catch (err: unknown) {
      console.error('Error updating competitor:', err);
      setCompetidores(competidoresAnteriores);
      
      let errorMessage = 'Error al actualizar competidor';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
      throw err;
    }
  };

  // OPTIMIZADO: Eliminar competidor (ELIMINACIÓN LOCAL INMEDIATA)
  const handleDeleteCompetitor = async (ci: string) => { 
       
    const competidoresAnteriores = [...competidores];
    
    // 1. Encontrar el competidor y obtener su ID de clave primaria
    const competidorAEliminar = competidores.find(comp => comp.ci === ci);

    if (!competidorAEliminar || !competidorAEliminar.id_olimpista) {
        alert('Error: No se encontró el ID interno del competidor para eliminar.');
        console.error('Competidor no encontrado o le falta id_olimpista:', competidorAEliminar);
        return;
    }

    try {
        // Optimización: Actualizar la interfaz de usuario inmediatamente
        const competidoresActualizados = competidores.filter(comp => 
            comp.ci !== ci
        );
        
        setCompetidores(competidoresActualizados);

        // 2. Realizar la petición a la API usando el ID de clave primaria
        // El backend espera: DELETE /olimpistas/{id_olimpista}
        await api.delete(`/olimpistas/${competidorAEliminar.id_olimpista}`);


        alert('Competidor eliminado exitosamente');
        
    } catch (err: unknown) {
        console.error('Error deleting competitor:', err);
        // Revertir el estado si la llamada a la API falla
        setCompetidores(competidoresAnteriores);
        
        let errorMessage = 'Error al eliminar competidor. El cambio fue revertido.';
        
        if (axios.isAxiosError(err)) {
            errorMessage = err.response?.data?.message || errorMessage;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        
        alert(errorMessage);
        throw err;
    }
};

  // Funciones para los botones (sin funcionalidad completa)
  const handleVerLista = () => {
    // Ya estamos en la lista, no hace nada
  };

  const handleGenerarListas = () => {
    alert('Función GENERAR LISTAS POR ÁREA Y NIVEL - En desarrollo');
  };
  
  const competidoresFiltrados = competidores.filter(comp =>
    comp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.ci.includes(filtro) ||
    comp.institucion.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.area.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPaginas = Math.ceil(competidoresFiltrados.length / COMPETIDORES_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * COMPETIDORES_POR_PAGINA;
  const indiceFin = indiceInicio + COMPETIDORES_POR_PAGINA;

  // **Competidores que se muestran en la tabla**
  const competidoresPaginados = competidoresFiltrados.slice(indiceInicio, indiceFin);

  // **Controladores de paginación**
  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };
  const irAnterior = () => irAPagina(paginaActual - 1);
  const irSiguiente = () => irAPagina(paginaActual + 1);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="gestion-competidores-page">
        <div className="management-container">
          <div className="flex justify-center items-center p-8">
            <div className="text-lg">Cargando competidores...</div>
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
              onClick={fetchCompetidores}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
  // **Cálculo para mostrar el rango actual**
  const rangoInicio = competidoresPaginados.length > 0 ? indiceInicio + 1 : 0;
  const rangoFin = indiceInicio + competidoresPaginados.length;

  return (
    <div className="gestion-competidores-page">
      {/* SECCIÓN DE CARGA DE OLIMPISTAS - IGUAL QUE EN CargarCSV */}
      <div className="carga-section">
        <CargarCSV 
          onVerLista={handleVerLista}
          onGenerarListas={handleGenerarListas}
        />
      </div>
      
      <div className="management-container">
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar competidor..."
                className="search-input"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <div className="search-icon">
                <svg className="search-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <CompetitorTable 
          competitors={competidoresPaginados}
          onEdit={handleEditCompetitor}
          onDelete={(id) => handleDeleteCompetitor(String(id))}
        />
      </div>

      {competidoresFiltrados.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {rangoInicio} - {rangoFin} de {competidoresFiltrados.length} competidores
          </span>
          <div className="pagination-controls">
            <button 
              onClick={irAnterior}
              disabled={paginaActual === 1} // **Deshabilitar en la primera página**
              className="pagination-btn pagination-btn-prev"
            >
              Anterior
            </button>
            {/* **Generación de botones de página simplificada** */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => irAPagina(page)}
                className={`pagination-btn ${page === paginaActual ? 'pagination-btn-active' : ''}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={irSiguiente}
              disabled={paginaActual === totalPaginas || totalPaginas === 0} // **Deshabilitar en la última página**
              className="pagination-btn pagination-btn-next"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCompetidores;