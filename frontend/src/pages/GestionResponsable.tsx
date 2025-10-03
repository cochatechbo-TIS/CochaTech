// src/pages/GestionResponsables.tsx
import React, { useState } from 'react';
import { ResponsableTable } from '../components/responsables/ResponsableTable';
import { EditResponsableModal } from '../components/responsables/EditResponsableModa';
import type { Responsable } from '../interfaces/Responsable';

const GestionResponsables: React.FC = () => {
  // Datos estáticos - sin useState para setResponsables ya que no los modificaremos
  const responsables: Responsable[] = [
    {
      id_responsable: 1,
      nombre: 'Roberto Gómez',
      documento: '12345678',
      email: 'roberto.gomez@ejemplo.com',
      telefono: '555-1234',
      area: 'Matemáticas',
      cargo: 'Coordinador'
    },
    {
      id_responsable: 2,
      nombre: 'Patricia Sánchez',
      documento: '87654321',
      email: 'patricia.sanchez@ejemplo.com',
      telefono: '555-5678',
      area: 'Física',
      cargo: 'Jefe de Área'
    },
    {
      id_responsable: 3,
      nombre: 'Miguel Torres',
      documento: '23456789',
      email: 'miguel.torres@ejemplo.com',
      telefono: '555-9012',
      area: 'Química',
      cargo: 'Coordinador'
    }
  ];

  const [filtro, setFiltro] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Funciones vacías por ahora
  const handleEditResponsable = async (editedResponsable: Responsable) => {
    console.log('Editar responsable:', editedResponsable);
    alert('Función de editar no implementada aún');
  };

  const handleDeleteResponsable = async (id: number) => {
    console.log('Eliminar responsable ID:', id);
    alert('Función de eliminar no implementada aún');
  };

  const handleCreateResponsable = async (newResponsable: Responsable) => {
    console.log('Crear responsable:', newResponsable);
    alert('Función de crear no implementada aún');
    setIsCreateModalOpen(false);
  };

  // Filtrar responsables
  const responsablesFiltrados = responsables.filter(resp =>
    resp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    resp.documento.includes(filtro) ||
    resp.email.toLowerCase().includes(filtro.toLowerCase()) ||
    resp.area.toLowerCase().includes(filtro.toLowerCase()) ||
    resp.cargo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="gestion-competidores-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Responsables Académicos</h1>
        <p className="page-subtitle">
          Administra la información de los responsables por área
        </p>
      </div>
      
      <div className="management-container">
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar responsable..."
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
            onClick={() => setIsCreateModalOpen(true)}
            className="primary-button"
          >
            <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nuevo Responsable</span>
          </button>
        </div>

        <ResponsableTable 
          responsables={responsablesFiltrados}
          onEdit={handleEditResponsable}
          onDelete={handleDeleteResponsable}
        />
      </div>

      {responsablesFiltrados.length > 0 && (
        <div className="pagination-section">
          <span className="pagination-info">
            Mostrando {responsablesFiltrados.length} de {responsables.length} responsables
          </span>
        </div>
      )}

      {/* Modal para crear nuevo responsable */}
      <EditResponsableModal
        responsable={null}
        onSave={handleCreateResponsable}
        onCancel={() => setIsCreateModalOpen(false)}
        isOpen={isCreateModalOpen}
      />
    </div>
  );
};

export default GestionResponsables;