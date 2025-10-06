// src/pages/Registro.tsx

import React, { useState } from 'react';
// Asegúrate que la ruta de importación sea correcta
import { RegistroNavigation } from '../components/registro/RegistroNavigation'; 
import GestionCompetidores from './GestionCompetidores';
import GestionResponsables from './GestionResponsable';
import { GestionEvaluadores } from './GestionEvaluadores';

type RegistroTab = 'olimpistas' | 'responsables' | 'evaluadores';

const Registro: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RegistroTab>('olimpistas');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'olimpistas':
        return <GestionCompetidores />;
      case 'responsables':
        return <GestionResponsables />;
      case 'evaluadores':
        return <GestionEvaluadores />;
      default:
        return <GestionCompetidores />;
    }
  };

  return (
    <div className="gestion-competidores-page">
      <div className="page-content-wrapper"> 
        {/* Cabecera "Registro" */}
        <div className="page-header">
          <h1 className="page-title">Registro</h1>
          <p className="page-subtitle">
            Gestiona la información de olimpistas, responsables y evaluadores
          </p>
        </div>

        {/* Componente de Navegación de Pestañas (RegistroNavigation) */}
        {/* Le pasamos la pestaña activa y la función para cambiarla */}
        <RegistroNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Contenido Dinámico */}
        <div className="registro-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Registro;