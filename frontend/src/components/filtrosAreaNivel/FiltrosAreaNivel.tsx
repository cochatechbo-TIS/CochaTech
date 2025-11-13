import React from 'react';
import './FiltrosAreaNivel.css';

interface FiltrosAreaNivelProps {
  areas: string[];
  niveles: string[];
  selectedArea: string;
  selectedNivel: string;
  onAreaChange: (area: string) => void;
  onNivelChange: (nivel: string) => void;
  showBusqueda?: boolean;
  busqueda?: string;
  onBusquedaChange?: (value: string) => void;
  placeholderBusqueda?: string;
}

const FiltrosAreaNivel: React.FC<FiltrosAreaNivelProps> = ({
  areas,
  niveles,
  selectedArea,
  selectedNivel,
  onAreaChange,
  onNivelChange,
  showBusqueda = false,
  busqueda = '',
  onBusquedaChange,
  placeholderBusqueda = ' Buscar algo...'
}) => {
  return (
    <div className="filtros-container">
      {showBusqueda && (
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={(e) => onBusquedaChange?.(e.target.value)}
            className="search-input"
          />
        </div>
      )}
      
      <div className="filtros-select-container">
        <select 
          value={selectedArea} 
          onChange={(e) => onAreaChange(e.target.value)} 
          className="filter-select"
        >
          <option value="">Todas las áreas</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <select 
          value={selectedNivel} 
          onChange={(e) => onNivelChange(e.target.value)} 
          className="filter-select"
          disabled={!selectedArea}
        >
          <option value="">Todos los niveles</option>
          {niveles.map((nivel) => (
            <option key={nivel} value={nivel}>{nivel}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltrosAreaNivel;