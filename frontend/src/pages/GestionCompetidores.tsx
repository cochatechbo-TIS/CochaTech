// src/pages/GestionCompetidores.tsx
import React, { useState, useEffect } from 'react'; // Agregar useEffect
import { CompetitorTable } from '../components/competidores/CompetitorTable';
import type { Competidor } from '../interfaces/Competidor';

const GestionCompetidores: React.FC = () => {
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // URL base de la API
  const API_BASE = 'http://localhost:8000/api';

  // FETCH: Obtener competidores de la base de datos
  const fetchCompetidores = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/olimpistas`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo cargar los datos`);
      }
      
      const data = await response.json();
      
      // Mapear los datos del backend a nuestra interfaz
      const competidoresMapeados = data.data.map((olimpista: Competidor) => ({
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
        departamento: olimpista.departamento, // objeto entero
        departamentoNombre: olimpista.departamento?.nombre_departamento || '' // 👈 este es el que vas a mostrar
    }));
      
      setCompetidores(competidoresMapeados);
      
    } catch (err) {
      console.error('Error fetching competidores:', err);
      setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar competidores al iniciar
  useEffect(() => {
    fetchCompetidores();
  }, []);

  // FETCH: Actualizar competidor
  const handleEditCompetitor = async (editedCompetitor: Competidor) => {
    try {
        const response = await fetch(`${API_BASE}/olimpistas/${editedCompetitor.id_olimpista}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ci: editedCompetitor.ci,
          nombre: editedCompetitor.nombre,
          institucion: editedCompetitor.institucion,
          area: editedCompetitor.area,
          nivel: editedCompetitor.nivel,
          grado: editedCompetitor.grado,
          contacto_tutor: editedCompetitor.contacto_tutor,
          id_departamento: editedCompetitor.id_departamento
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar competidor');
      }

      // Recargar los datos actualizados
      await fetchCompetidores();
      alert('Competidor actualizado exitosamente');
      
    } catch (err) {
      console.error('Error updating competitor:', err);
      alert('Error al actualizar competidor');
      throw err;
    }
  };

  // FETCH: Eliminar competidor
  const handleDeleteCompetitor = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este competidor?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/olimpistas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar competidor');
      }

      // Recargar los datos actualizados
      await fetchCompetidores();
      alert('Competidor eliminado exitosamente');
      
    } catch (err) {
      console.error('Error deleting competitor:', err);
      alert('Error al eliminar competidor');
      throw err;
    }
  };
  
  const competidoresFiltrados = competidores.filter(comp =>
    comp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.documento?.includes(filtro) ||
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
          
          <button 
            onClick={() => {/* Lógica para nuevo competidor */}}
            className="primary-button"
          >
            <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nuevo Competidor</span>
          </button>
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