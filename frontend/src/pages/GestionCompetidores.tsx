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

const GestionCompetidores: React.FC = () => {
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // URL base de la API
  const API_BASE = 'http://localhost:8000/api';

  const api = React.useMemo(() => axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }), [API_BASE]);

  const fetchCompetidores = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Cargando competidores...');
      const response = await api.get('/olimpistas');
      
      // Mapear los datos del backend a nuestra interfaz
      const competidoresMapeados = response.data.data.map((olimpista: Competidor) => ({
        id: olimpista.id_olimpista,
        id_olimpista: olimpista.id_olimpista,
        nombre: olimpista.nombre || '',
        documento: olimpista.ci || '',
        ci: olimpista.ci || '',
        institucion: olimpista.institucion || '',
        area: olimpista.area || '',
        nivel: olimpista.nivel || '',
        gradoEscolaridad: olimpista.grado || '',
        grado: olimpista.grado || '',
        contactoTutor: olimpista.contacto_tutor || '',
        contacto_tutor: olimpista.contacto_tutor || '',
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

  // OPTIMIZADO: Actualizar competidor (ACTUALIZACIÓN LOCAL INMEDIATA)
  const handleEditCompetitor = async (editedCompetitor: Competidor) => {
    // ... (mantén tu código existente de handleEditCompetitor)
    const competidoresAnteriores = [...competidores]; 
    
    try {
      const competidoresActualizados = competidores.map(comp => 
        comp.id_olimpista === editedCompetitor.id_olimpista 
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
        area: editedCompetitor.area,
        nivel: editedCompetitor.nivel,
        grado: editedCompetitor.grado,
        contacto_tutor: editedCompetitor.contacto_tutor,
        id_departamento: editedCompetitor.id_departamento
      });

      if (response.data.data) {
        const competidorActualizado = response.data.data;
        const competidoresFinales = competidoresActualizados.map(comp => 
          comp.id_olimpista === editedCompetitor.id_olimpista 
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
  const handleDeleteCompetitor = async (id: number) => {
    // ... (mantén tu código existente de handleDeleteCompetitor)
    if (!window.confirm('¿Estás seguro de que deseas eliminar este competidor?')) {
      return;
    }
    
    const competidoresAnteriores = [...competidores];
    try {
      const competidoresActualizados = competidores.filter(comp => 
        comp.id_olimpista !== id
      );
      
      setCompetidores(competidoresActualizados);

      await api.delete(`/olimpistas/${id}`);

      alert('Competidor eliminado exitosamente');
      
    } catch (err: unknown) {
      console.error('Error deleting competitor:', err);
      setCompetidores(competidoresAnteriores);
      
      let errorMessage = 'Error al eliminar competidor';
      
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
    comp.documento?.includes(filtro) ||
    comp.institucion.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.area.toLowerCase().includes(filtro.toLowerCase())
  );

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
          competitors={competidoresFiltrados}
          onEdit={handleEditCompetitor}
          onDelete={handleDeleteCompetitor}
        />
      </div>

      {competidoresFiltrados.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {competidoresFiltrados.length} de {competidores.length} competidores
          </span>
          <div className="pagination-controls">
            <button className="pagination-btn pagination-btn-prev">
              Anterior
            </button>
            <button className="pagination-btn pagination-btn-active">1</button>
            <button className="pagination-btn pagination-btn-next">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCompetidores;