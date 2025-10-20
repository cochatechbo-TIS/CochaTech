// src/pages/Registro.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect for logging
import { RegistroNavigation } from '../components/registro/RegistroNavigation';
import GestionCompetidores from './GestionCompetidores';
import GestionResponsables from './GestionResponsable';
import GestionEvaluadores from './GestionEvaluadores';

type RegistroTab = 'olimpistas' | 'responsables' | 'evaluadores';

const Registro: React.FC = () => {
  // LOG 1: Check if Registro component itself renders
  console.log('[Registro] Component rendering...');

  const [activeTab, setActiveTab] = useState<RegistroTab>('olimpistas');

  // LOG 2: Log when the active tab changes
  useEffect(() => {
    console.log(`[Registro] Active tab changed to: ${activeTab}`);
  }, [activeTab]);

  const renderActiveTab = () => {
    // LOG 3: Log which component is about to be rendered
    console.log(`[Registro] Trying to render component for tab: ${activeTab}`);
    switch (activeTab) {
      case 'olimpistas':
        return <GestionCompetidores />;
      case 'responsables':
        return <GestionResponsables />;
      case 'evaluadores':
        return <GestionEvaluadores />;
      default:
        // LOG 4: Log if default case is hit (shouldn't happen)
        console.warn('[Registro] Default case in renderActiveTab hit!');
        return <GestionCompetidores />;
    }
  };

  return (
    <div className="gestion-competidores-page">
      <div className="page-content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Registro</h1>
          <p className="page-subtitle">
            Gestiona la información de olimpistas, responsables y evaluadores
          </p>
        </div>

        <RegistroNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="registro-content">

          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Registro;