// src/pages/Configuracion.tsx

import React, { useState } from 'react';
import { TabNavigation } from '../components/registro/TabNavigation';
import ParametrizacionMedallero from '../components/Historial/ParametrizacionMedallero';
//import FinalizacionProceso from '../components/historial/FinalizacionProceso';

type HistorialTab = 'cambios' | 'parametrizacion' | 'finalizacion';

const Historial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HistorialTab>('parametrizacion');

  const historialTabs = [
    //{ id: 'cambios', label: 'Log de cambios' },
    { id: 'parametrizacion', label: 'Parametrización del Medallero' },
    { id: 'finalizacion', label: 'Finalización del Proceso' },
  ];

  // Cada página tiene su propia lógica de qué mostrar según la pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cambios':
        return (
        <div className="en-desarrollo">
          <p>En desarrollo</p>
        </div>
      );
      case 'parametrizacion':
        return <ParametrizacionMedallero />;
      case 'finalizacion':
        return (
        <div className="en-desarrollo">
          <p>En desarrollo</p>
        </div>
      );
      default:
        return <ParametrizacionMedallero />;
    }
  };

  return (
    <div className="gestion-competidores-page">
      <div className="page-content-wrapper"> 
        <div className="page-header">
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">
            Gestiona la configuración del sistema
          </p>
        </div>

        <TabNavigation 
          tabs={historialTabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as HistorialTab)}
        />
        
        <div className="historial-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Historial;