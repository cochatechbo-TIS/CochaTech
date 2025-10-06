// src/components/evaluadores/GestionEvaluadores.tsx
import React from 'react';

export const GestionEvaluadores: React.FC = () => {
  return (
    <div className="gestion-evaluadores">
      <div className="section-header">
        <h2 className="section-title">Gestión de Evaluadores</h2>
        <p className="section-subtitle">Administra la información de los evaluadores</p>
      </div>
      
      <div className="action-buttons-section">
        <div className="action-buttons-container">
          <button className="action-btn action-btn-primary">
            AGREGAR EVALUADOR
          </button>
          
        </div>
      </div>

      {/* Aquí irá tu tabla de evaluadores */}
      <div className="table-container">
        <p>Tabla de evaluadores en desarrollo...</p>
      </div>
    </div>
  );
};