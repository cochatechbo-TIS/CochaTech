// src/components/registro/RegistroNavigation.tsx

import React from 'react';

// Define el mismo tipo para mantener consistencia
type RegistroTab = 'olimpistas' | 'responsables' | 'evaluadores';

interface RegistroNavigationProps {
  activeTab: RegistroTab;
  onTabChange: (tab: RegistroTab) => void;
}

export const RegistroNavigation: React.FC<RegistroNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: RegistroTab, label: string }[] = [
    { id: 'olimpistas', label: 'Olimpistas' },
    { id: 'responsables', label: 'Responsables' },
    { id: 'evaluadores', label: 'Evaluadores' },
  ];

  return (
    // Usa la clase principal para el contenedor (donde va la línea gris base)
    <div className="registro-navigation"> 
      {tabs.map((tab) => (
        <button
          key={tab.id}
          // Aplica 'active' si la pestaña coincide con la activa
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
};