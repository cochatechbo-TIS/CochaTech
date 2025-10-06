// src/components/carga-masiva/CargarCSV.tsx
import React, { useRef } from 'react';
import './CargarCSV.css';

interface CargarCSVProps {
  onVerLista?: () => void;
  onGenerarListas?: () => void;
}

function CargarCSV({ onVerLista, onGenerarListas }: CargarCSVProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (fileObj && fileObj.name.endsWith('.csv')) {
      if (window.confirm(`¿Estás seguro de que deseas cargar el archivo ${fileObj.name}? Esta acción podría sobrescribir datos existentes.`)) {
        // Simular carga exitosa
        alert('¡Archivo cargado exitosamente!');
        // Limpiar el input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      } else {
        // Limpiar el input si el usuario cancela
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }
  };

  const handleSelectCSV = () => {
    inputRef.current?.click();
  };

  const handleVerLista = () => {
    if (onVerLista) {
      onVerLista();
    } else {
      alert('Función VER LISTA - En desarrollo');
    }
  };

  const handleGenerarListas = () => {
    if (onGenerarListas) {
      onGenerarListas();
    } else {
      alert('Función GENERAR LISTAS POR ÁREA Y NIVEL - En desarrollo');
    }
  };

  return (
    <div className="management-container">
      {/* Header con título y descripción */}
      <div className="csv-header">
        <h1 className="csv-title">Carga de Olimpistas</h1>
        <p className="csv-description">
          Sube un archivo CSV con los datos de los olimpistas. El archivo debe contener las siguientes columnas: 
          Nombre completo, CI, Tutor legal, Contacto del tutor, Unidad educativa, Departamento, Grado, Área de competencia, Nivel, Tutor académico (opcional).
        </p>
      </div>

      {/* Los 3 botones de acción */}
      <div className="carga-action-buttons">
        <button className="btn-primary" onClick={handleSelectCSV}>
          SELECCIONAR CSV
        </button>
        <button className="btn-secondary" onClick={handleVerLista}>
          VER LISTA
        </button>
        <button className="btn-secondary" onClick={handleGenerarListas}>
          GENERAR LISTAS POR ÁREA Y NIVEL
        </button>
        
        <input
          type="file"
          accept=".csv"
          ref={inputRef}
          className="csv-file-input-hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default CargarCSV;