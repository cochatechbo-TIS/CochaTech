// src/pages/GestionCompetidores.tsx
import React, { useState } from 'react';
import { CompetitorTable } from '../components/competidores/CompetitorTable';
import type { Competidor } from '../interfaces/Competidor';

const GestionCompetidores: React.FC = () => {
  const [competidores, setCompetidores] = useState<Competidor[]>([
    { 
      id: 1, 
      nombre: 'Ana García', 
      documento: '12345678', 
      institucion: 'Colegio San José', 
      area: 'Matemáticas', 
      nivel: 'Nivel 1',
      gradoEscolaridad: 'Secundaria',
      contactoTutor: '71234567',
      departamento: 'La Paz'
    },
    { 
      id: 2, 
      nombre: 'Carlos Rodríguez', 
      documento: '23456789', 
      institucion: 'Instituto Nacional', 
      area: 'Física', 
      nivel: 'Nivel 2',
      gradoEscolaridad: 'Bachillerato',
      contactoTutor: '72345678',
      departamento: 'Cochabamba'
    },
    { 
      id: 3, 
      nombre: 'María López', 
      documento: '34567890', 
      institucion: 'Colegio San José', 
      area: 'Química', 
      nivel: 'Nivel 3',
      gradoEscolaridad: 'Secundaria',
      contactoTutor: '73456789',
      departamento: 'Santa Cruz'
    }
  ]);

  const [filtro, setFiltro] = useState('');

  const competidoresFiltrados = competidores.filter(comp =>
    comp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.documento.includes(filtro) ||
    comp.institucion.toLowerCase().includes(filtro.toLowerCase()) ||
    comp.area.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleEditCompetitor = (editedCompetitor: Competidor) => {
    setCompetidores(prev => 
      prev.map(comp => 
        comp.id === editedCompetitor.id ? editedCompetitor : comp
      )
    );
    alert('Competidor actualizado exitosamente');
  };

  const handleDeleteCompetitor = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este competidor?')) {
      setCompetidores(prev => prev.filter(comp => comp.id !== id));
      alert('Competidor eliminado exitosamente');
    }
  };

  // En tu GestionCompetidores.tsx, actualiza el return:
return (
  <div className="gestion-competidores-page">
    {/* Header de la página - ahora alineado a la izquierda */}
    <div className="page-header">
      <h1 className="page-title">Gestión de Competidores</h1>
      <p className="page-subtitle">
        Administra la información de los participantes registrados
      </p>
    </div>
    
    {/* Contenedor blanco que engloba todo */}
    <div className="management-container">
      {/* Barra de búsqueda y botón */}
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

      {/* Tabla de competidores */}
      <CompetitorTable 
        competitors={competidoresFiltrados}
        onEdit={handleEditCompetitor}
        onDelete={handleDeleteCompetitor}
      />
    </div>

    {/* Información de paginación */}
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