import React, { useState, useEffect } from 'react';
import './ParametrizacionMedallero.css';
import api from '../../services/api';
import { Pencil, Save } from 'lucide-react';
import { NotificationModal } from '../../components/common/NotificationModal'; // Ajusta la ruta según tu estructura
import { RangoNotaMedallas } from './RangoNotaMedallas';


interface MedalConfigGet {
  area: string;
  oro: number;
  plata: number;
  bronce: number;
  mencion: number;
  total: number;
}

// Esta interfaz representa la estructura de datos que viene del backend
interface MedalConfigPost {
  area: string;
  premios: {
    oro: number;
    plata: number;
    bronce: number;
    mención: number;
  };
}
// Interfaz para el estado interno del componente
interface MedalConfigInternal {
  area: string;
  oro: number | string;
  plata: number | string;
  bronce: number | string;
  mención: number | string;
  total?: number;
}

const MAX_PER_MEDAL = 10; // Definimos la constante para el máximo

const ParametrizacionMedallero: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [medalConfig, setMedalConfig] = useState<MedalConfigInternal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalMedalConfig, setOriginalMedalConfig] = useState<MedalConfigInternal[] | null>(null);
  const [notificationModal, setNotificationModal] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'confirm' | 'input',
    title: ''
  });

  useEffect(() => {
    fetchParametrizacion();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info', title?: string) => {
    setNotificationModal({
      isVisible: true,
      message,
      type,
      title: title || ''
    });
  };

  const closeNotification = () => {
    setNotificationModal(prev => ({ ...prev, isVisible: false }));
  };

  const fetchParametrizacion = async () => {
    try {
      setLoading(true);

      // Hacemos ambas llamadas a la API en paralelo para mayor eficiencia
      const [areasResponse, configResponse] = await Promise.all([
        api.get<{ id_area: number; nombre: string }[]>('/areas/nombres'),
        api.get<MedalConfigGet[]>('/medallero-config')
      ]);

      const allAreas = areasResponse.data;
      const existingConfigs = configResponse.data;

      // Creamos un mapa para buscar configuraciones existentes fácilmente
      const configMap = new Map(existingConfigs.map(config => [config.area, config]));

      // Combinamos la lista completa de áreas con las configuraciones existentes
      const fullConfig: MedalConfigInternal[] = allAreas.map(area => {
        const existing = configMap.get(area.nombre);
        return {
          area: area.nombre,
          oro: existing?.oro || 0,
          plata: existing?.plata || 0,
          bronce: existing?.bronce || 0,
          mención: existing?.mencion || 0,
          total: existing?.total || 0
        };
      });

      setMedalConfig(fullConfig);

    } catch (error) {
      console.error('Error al cargar la parametrización:', error);
      showNotification('Error al cargar la configuración del medallero', 'error', 'Error de Carga');      
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, field: keyof Omit<MedalConfigInternal, 'area'>, value: string) => {
    if (!isEditing) return;
    
    const newConfig = [...medalConfig];
    
    if (value === '') {
      newConfig[index] = { ...newConfig[index], [field]: '' };
      // quitar error si existe (vacío permitido mientras edita)
      } else {
      const numValue = parseInt(value, 10);

      // Permitimos el valor si es un número válido y no es negativo
      if (!isNaN(numValue) && numValue >= 0) {

        // Si supera el máximo, lo forzamos al máximo y registramos error
        if (numValue > MAX_PER_MEDAL) {
          newConfig[index] = { ...newConfig[index], [field]: MAX_PER_MEDAL };
          showNotification(`El valor máximo por tipo de medalla es ${MAX_PER_MEDAL}. Se ha ajustado automáticamente.`, 'info', 'Límite alcanzado');
        } else {
          newConfig[index] = { ...newConfig[index], [field]: numValue };
        }
      }
    }
    setMedalConfig(newConfig);
  };

  const calculateTotal = (config: MedalConfigInternal): number => {
    const oro = Number(config.oro) || 0;
    const plata = Number(config.plata) || 0;
    const bronce = Number(config.bronce) || 0;
    const mencion = Number(config.mención) || 0;

    return oro + plata + bronce + mencion;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Transformar los datos al formato que espera el backend
      const dataToSave : MedalConfigPost[] = medalConfig.map(config => ({
        area: config.area,
        premios: {
          oro: Number(config.oro) || 0,
          plata: Number(config.plata) || 0,
          bronce: Number(config.bronce) || 0,
          mención: Number(config.mención) || 0
        }
      }));

      console.log('Enviando datos al backend:', dataToSave); // Para debugging

      await api.post('/medallero-config', dataToSave);

      // Actualizamos el estado local con los nuevos totales calculados
      const updatedConfigWithTotals = medalConfig.map(config => ({
        area: config.area,
        oro: Number(config.oro) || 0,
        plata: Number(config.plata) || 0,
        bronce: Number(config.bronce) || 0,
        mención: Number(config.mención) || 0, // Asegúrate que la propiedad es 'mención'
        total: calculateTotal(config)
      }));
      setMedalConfig(updatedConfigWithTotals);
      setOriginalMedalConfig(JSON.parse(JSON.stringify(updatedConfigWithTotals)));
      setIsEditing(false);
      
      showNotification('Configuración guardada exitosamente', 'success', 'Guardado Exitoso');
      
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      showNotification('Error al guardar la configuración', 'error', 'Error de Guardado');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    // Guardamos una copia profunda del estado actual antes de empezar a editar
    setOriginalMedalConfig(medalConfig.map(c => ({...c})));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (originalMedalConfig) {
      setMedalConfig(originalMedalConfig);
    }
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
      <NotificationModal
        isVisible={notificationModal.isVisible}
        message={notificationModal.message}
        type={notificationModal.type}
        title={notificationModal.title}
        onClose={closeNotification}
      />
      <div className="edit-button-container">
        {!isEditing ? (
          <button className="btn-primary" onClick={handleEdit}>
            <Pencil size={16}/> EDITAR CONFIGURACIÓN
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn-primary"
              onClick={handleSave}
              disabled={saving}
              >
              <Save size={16} /> GUARDAR CAMBIOS
            </button>
            <button className="btn-secondary" onClick={handleCancel} disabled={saving}>
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
                    disabled={!isEditing || saving}
                    min="0"
                    max={MAX_PER_MEDAL}
                  />
                </td>
                <td className='competitor-table-td'>
                  <input 
                    type="number" 
                    className={`medal-input ${isEditing ? 'editing' : ''}`}
                    value={config.plata}
                    onChange={(e) => handleInputChange(index, 'plata', e.target.value)}
                    disabled={!isEditing || saving}
                    min="0"
                    max={MAX_PER_MEDAL}
                  />
                  </td>
                <td className='competitor-table-td'>
                  <input 
                    type="number" 
                    className={`medal-input ${isEditing ? 'editing' : ''}`}
                    value={config.bronce}
                    onChange={(e) => handleInputChange(index, 'bronce', e.target.value)}
                    disabled={!isEditing || saving}
                    min="0"
                    max={MAX_PER_MEDAL}
                  />
                </td>
                <td className='competitor-table-td'>
                  <input 
                    type="number" 
                    className={`medal-input ${isEditing ? 'editing' : ''}`}
                    value={config.mención}
                    onChange={(e) => handleInputChange(index, 'mención', e.target.value)}
                    disabled={!isEditing || saving}
                    min="0"
                    max={MAX_PER_MEDAL}
                  />
                </td>
                <td className="competitor-table-td total-value">
                  {isEditing ? calculateTotal(config) : config.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rango-nota-container">
        <RangoNotaMedallas />
      </div>
    </div>
  );
};

export default ParametrizacionMedallero;