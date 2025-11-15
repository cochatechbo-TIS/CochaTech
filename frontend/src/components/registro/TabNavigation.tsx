// src/components/registro/RegistroNavigation.tsx

import React from 'react';

// Componente genérico de navegación por pestañas
interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs : Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
    return (
    // Usa la clase principal para el contenedor (donde va la línea gris base)
    <div className={`registro-navigation ${className}`.trim()}> 
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