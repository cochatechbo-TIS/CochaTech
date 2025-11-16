// src/components/historial/ParametrizacionMedallero.tsx

import React, { useState, useEffect } from 'react';
import './ParametrizacionMedallero.css';
import { Pencil, Save } from 'lucide-react';

interface MedalConfig {
  area: string;
  oro: number;
  plata: number;
  bronce: number;
  mencion: number;
}

interface ParametrizacionData {
  configuracion: MedalConfig[];
  ultimaModificacion?: string;
  modificadoPor?: string;
}

const ParametrizacionMedallero: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [medalConfig, setMedalConfig] = useState<MedalConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaModificacion, setUltimaModificacion] = useState<string>('');
  const [modificadoPor, setModificadoPor] = useState<string>('');

  // TODO: Reemplazar con la llamada real a la API
  useEffect(() => {
    fetchParametrizacion();
  }, []);

  const fetchParametrizacion = async () => {
    try {
      setLoading(true);
      
      // TODO: Reemplazar con la llamada real al backend
      // const response = await fetch('/api/parametrizacion-medallero');
      // const data = await response.json();
      
      // Datos de prueba mientras no esté la conexión con el backend
      const dataPrueba: ParametrizacionData = {
        configuracion: [
          { area: 'Matemática', oro: 1, plata: 2, bronce: 3, mencion: 5 },
          { area: 'Física', oro: 1, plata: 2, bronce: 3, mencion: 5 },
          { area: 'Química', oro: 1, plata: 2, bronce: 3, mencion: 5 },
          { area: 'Biología', oro: 1, plata: 2, bronce: 3, mencion: 5 },
          { area: 'Informática', oro: 1, plata: 2, bronce: 3, mencion: 5 },
          { area: 'Robótica', oro: 1, plata: 2, bronce: 3, mencion: 5 },
          { area: 'Astronomía', oro: 1, plata: 2, bronce: 3, mencion: 5 },
          { area: 'Literatura', oro: 1, plata: 2, bronce: 3, mencion: 5 },
        ],
        ultimaModificacion: '2024-01-15 14:30:00',
        modificadoPor: 'admin@olimpiada.org'
      };

      setMedalConfig(dataPrueba.configuracion);
      setUltimaModificacion(dataPrueba.ultimaModificacion || '');
      setModificadoPor(dataPrueba.modificadoPor || '');
    } catch (error) {
      console.error('Error al cargar la parametrización:', error);
      // TODO: Mostrar mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, field: keyof Omit<MedalConfig, 'area'>, value: string) => {
    if (!isEditing) return;
    
    const newConfig = [...medalConfig];
    const numValue = parseInt(value) || 0;
    
    // Validación: no permitir números negativos
    if (numValue < 0) return;
    
    newConfig[index] = { 
      ...newConfig[index], 
      [field]: numValue 
    };
    setMedalConfig(newConfig);
  };

  const calculateTotal = (config: MedalConfig): number => {
    return config.oro + config.plata + config.bronce + config.mencion;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // TODO: Aquí iría la lógica para guardar los cambios
      // await saveParametrizacion(medalConfig);
      console.log('Guardando cambios:', medalConfig);
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Recargar los datos originales
    fetchParametrizacion();
  };

  if (loading) {
    return (
      <div className="management-container">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="management-container">
        <div className="edit-button-container">
        {!isEditing ? (
          <button className="btn-primary" onClick={handleEditToggle}>
            <Pencil size={16}/> EDITAR CONFIGURACIÓN
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn-primary" onClick={handleEditToggle}>
              <Save size={16} /> GUARDAR CAMBIOS
            </button>
            <button className="btn-secondary" onClick={handleCancel}>
              CANCELAR
            </button>
            
          </div>
        )}
      </div>

      <div className="competitor-table-container">
        <table className="competitor-table">
          <thead className='competitor-table-header'>
            <tr>
              <th className="competitor-table-th">Área</th>
              <th className="competitor-table-th">🥇 Oro</th>
              <th className="competitor-table-th">🥈 Plata</th>
              <th className="competitor-table-th">🥉 Bronce</th>
              <th className="competitor-table-th">🎖️ Mención</th>
              <th className="competitor-table-th">Total</th>
            </tr>
          </thead>
          <tbody className="competitor-table-body">
            {medalConfig.map((config, index) => (
              <tr key={config.area} className='competitor-table-row'>
                <td className="competitor-table-td competitor-table-td-name">
                    {config.area}
                </td>
                <td className="competitor-table-td">
                  <input 
                    type="number" 
                    className={`medal-input ${isEditing ? 'editing' : ''}`}
                    value={config.oro}
                    onChange={(e) => handleInputChange(index, 'oro', e.target.value)}
                    disabled={!isEditing}
                    min="0"
                  />
                </td>
                <td className='competitor-table-td'>
                  <input 
                    type="number" 
                    className={`medal-input ${isEditing ? 'editing' : ''}`}
                    value={config.plata}
                    onChange={(e) => handleInputChange(index, 'plata', e.target.value)}
                    disabled={!isEditing}
                    min="0"
                  />
                </td>
                <td className='competitor-table-td'>
                  <input 
                    type="number" 
                    className={`medal-input ${isEditing ? 'editing' : ''}`}
                    value={config.bronce}
                    onChange={(e) => handleInputChange(index, 'bronce', e.target.value)}
                    disabled={!isEditing}
                    min="0"
                  />
                </td>
                <td className='competitor-table-td'>
                  <input 
                    type="number" 
                    className={`medal-input ${isEditing ? 'editing' : ''}`}
                    value={config.mencion}
                    onChange={(e) => handleInputChange(index, 'mencion', e.target.value)}
                    disabled={!isEditing}
                    min="0"
                  />
                </td>
                <td className="competitor-table-td total-value">{calculateTotal(config)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="footer-info">
        <p><strong>Última modificación:</strong> {ultimaModificacion || 'No disponible'}</p>
        <p><strong>Realizada por:</strong> {modificadoPor || 'No disponible'}</p>
      </div>
    </div>
  );
};

export default ParametrizacionMedallero;