// src/pages/GestionCompetidores.tsx
import React, { useState, useEffect } from 'react';
import { CompetitorTable } from '../components/competidores/CompetitorTable';
import type { Competidor } from '../interfaces/Competidor';
import api from '../services/api'; // CORREGIDO: Importa la instancia de Axios

const GestionCompetidores: React.FC = () => {
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CORREGIDO: Usa api.get para obtener los competidores
  const fetchCompetidores = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get<Competidor[]>('/olimpistas');
      
      // El backend ya devuelve los datos en el formato correcto
      setCompetidores(response.data);
      
    } catch (err: any) {
      console.error('Error fetching competidores:', err);
      const message = err.response?.status === 401
        ? 'No estás autenticado. Por favor, inicia sesión.'
        : 'No se pudo conectar con el servidor.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetidores();
  }, []);

  // CORREGIDO: Usa api.put y la clave primaria 'ci'
  const handleEditCompetitor = async (editedCompetitor: Competidor) => {
    try {
      // La URL usa el 'ci' del competidor para identificarlo
      const response = await api.put(`/olimpistas/${editedCompetitor.ci}`, editedCompetitor);

      if (response.status !== 200) {
        throw new Error('Error al actualizar competidor');
      }

      await fetchCompetidores(); // Recarga los datos
      alert('Competidor actualizado exitosamente');
      
    } catch (err) {
      console.error('Error updating competitor:', err);
      alert('Error al actualizar competidor');
      throw err;
    }
  };

  // CORREGIDO: Usa api.delete, espera un 'ci' (string) y lo pasa a la URL
  const handleDeleteCompetitor = async (ci: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este competidor?')) {
      return;
    }

    try {
      const response = await api.delete(`/olimpistas/${ci}`);

      if (response.status !== 204) { // 204 No Content es la respuesta estándar para delete
        throw new Error('Error al eliminar competidor');
      }

      await fetchCompetidores(); // Recarga los datos
      alert('Competidor eliminado exitosamente');
      
    } catch (err) {
      console.error('Error deleting competitor:', err);
      alert('Error al eliminar competidor');
      throw err;
    }
  };
  
  const competidoresFiltrados = competidores.filter(comp =>
    comp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.ci.includes(filtro) ||
    comp.institucion.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.area.toLowerCase().includes(filtro.toLowerCase())
  );

  // Estados de carga y error (mantener tus estilos)
  if (loading) {
    return (
      <div className="gestion-competidores-page">
        <div className="page-header">
          <h1 className="page-title">Gestión de Competidores</h1>
          <p className="page-subtitle">Administra la información de los participantes registrados</p>
        </div>
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
        <div className="page-header">
          <h1 className="page-title">Gestión de Competidores</h1>
          <p className="page-subtitle">Administra la información de los participantes registrados</p>
        </div>
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

  // Tu return exactamente igual - NO CAMBIES LOS ESTILOS
  return (
    <div className="gestion-competidores-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Competidores</h1>
        <p className="page-subtitle">
          Administra la información de los participantes registrados
        </p>
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
          onDelete={(id) => handleDeleteCompetitor(String(id))}
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