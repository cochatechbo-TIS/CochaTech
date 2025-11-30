import React from 'react';
import './FiltrosAreaNivel.css';
import { ChevronDown } from "lucide-react";
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
  isAdmin: boolean;
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
  placeholderBusqueda = ' Buscar algo...',
  isAdmin
}) => {
  
  return (
    <div className="filtros-wrapper">
      <div className="filtros-row">
      {showBusqueda && (
        <div className="filtro-search-container">
          <svg className="filtro-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={(e) => onBusquedaChange?.(e.target.value)}
            className="filtro-search-input"
          />
        </div>
      )}
      <div className="filtro-selects">
        {isAdmin && (
        <div className="filtro-select-wrapper">
        <select 
          value={selectedArea} 
          onChange={(e) => onAreaChange(e.target.value)} 
          className="filtro-select"
        >
          <option value="">Todas las áreas</option>
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
              </option>
          ))}
        </select>
          <ChevronDown className="filtro-select-icon" size={18} />
        </div>
        )}
        <div className="filtro-select-wrapper">
  <select
    value={selectedNivel}
    onChange={(e) => onNivelChange(e.target.value)}
    className="filtro-select"
    disabled={!selectedArea}
  >
    <option value="">Todos los niveles</option>
    {niveles.map((nivel) => (
      <option key={nivel} value={nivel}>{nivel}</option>
    ))}
  </select>
  <ChevronDown className="filtro-select-icon" size={18} />
</div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosAreaNivel;